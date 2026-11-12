"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Save } from "lucide-react";
import { getAdminAmortissements, getAdminSettings, parseAdminArraySetting, updateAdminAmortissement, updateAdminArraySetting, updateAdminSetting } from "@/lib/adminSettingsService";
import type { AdminAmortissement, AdminSetting } from "@/types/adminSettings";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MultiSelect from "@/components/admin/MultiSelect";
import { ADMIN_ARRAY_SETTING_OPTIONS } from "@/lib/adminSettingArrayOptions";
import { useRouter } from "next/navigation";

// Groups seeded by bp-back DatabaseInitializer; unknown groups fall back to their raw key.
const GROUPS: Record<string, { label: string; description: string }> = {
  bfr: { label: "BFR", description: "Besoin en fonds de roulement" },
  tax: { label: "TVA", description: "Taxe sur la valeur ajoutée par défaut" },
  impots: { label: "Impôts", description: "Barèmes et taux d’imposition applicables" },
  investissement: { label: "Investissement", description: "Classification des immobilisations" },
  finance: { label: "Financement", description: "Conditions d’emprunt par défaut" },
  calc: { label: "Calcul", description: "Constantes utilisées par le moteur de calcul" },
};

function displayGroup(value?: string) {
  if (!value || value === "default") return "Configuration générale";
  return GROUPS[value]?.label ?? value.replaceAll("_", " ");
}

function formatError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "SESSION_EXPIRED") return "Votre session a expiré. Veuillez vous reconnecter.";
  if (code === "ACCESS_DENIED") return "Vous n’avez pas les droits pour modifier ces paramètres.";
  if (code === "INVALID_VALUE") return "La valeur est invalide selon les règles backend.";
  if (code === "NOT_FOUND") return "Le paramètre demandé est introuvable.";
  return "Une erreur est survenue. Réessayez dans un instant.";
}

export default function AdminSettingsClient() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [amortissements, setAmortissements] = useState<AdminAmortissement[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [arrayDrafts, setArrayDrafts] = useState<Record<string, string[]>>({});
  const [amortDrafts, setAmortDrafts] = useState<Record<string, AdminAmortissement>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError(""); setNotice("");
    try {
      const [config, amort] = await Promise.all([getAdminSettings(), getAdminAmortissements()]);
      setSettings(config); setAmortissements(amort);
      setDrafts(Object.fromEntries(config.map((item) => [item.key, item.value ?? ""])));
      setArrayDrafts(Object.fromEntries(config.filter((item) => item.valueType === "arrays").map((item) => [item.key, parseAdminArraySetting(item.value)])));
      setAmortDrafts(Object.fromEntries(amort.map((item) => [item.typeKey, { ...item }])));
    } catch (caught) {
      setError(formatError(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const groups = useMemo(() => settings.reduce<Record<string, AdminSetting[]>>((result, item) => {
    const group = item.group || "default";
    (result[group] ||= []).push(item);
    return result;
  }, {}), [settings]);

  async function saveSetting(setting: AdminSetting) {
    const value = drafts[setting.key] ?? "";
    const arrayValue = arrayDrafts[setting.key] ?? parseAdminArraySetting(setting.value);
    const allowedOptions = ADMIN_ARRAY_SETTING_OPTIONS[setting.key] ?? [];
    if (setting.valueType === "arrays" && (
      arrayValue.length === 0 || arrayValue.some((item) => !allowedOptions.some((option) => option.value === item))
    )) {
      setError(arrayValue.length === 0
        ? `Au moins une valeur est requise pour ${setting.key}.`
        : `Retirez les valeurs non autorisées de ${setting.key}.`);
      return;
    }
    if (setting.valueType === "number" && (value.trim() === "" || !Number.isFinite(Number(value)))) { setError(`Valeur numérique invalide pour ${setting.key}.`); return; }
    setSaving(setting.key); setError(""); setNotice("");
    try {
      if (setting.valueType === "arrays") await updateAdminArraySetting(setting, arrayValue);
      else await updateAdminSetting({ ...setting, value });
      const savedValue = setting.valueType === "arrays" ? arrayValue.join(",") : value;
      setSettings((current) => current.map((item) => item.key === setting.key ? { ...item, value: savedValue } : item));
      setNotice(`${setting.key} a été enregistré.`);
    }
    catch (caught) { setError(formatError(caught)); if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login"); }
    finally { setSaving(null); }
  }

  async function saveAmortissement(value: AdminAmortissement) {
    const draft = amortDrafts[value.typeKey] || value;
    if (!Number.isFinite(Number(draft.tauxAnnuel)) || Number(draft.tauxAnnuel) < 0 || Number(draft.tauxAnnuel) > 1 || !Number.isInteger(Number(draft.dureeAnnees)) || Number(draft.dureeAnnees) <= 0) { setError("Le taux doit être compris entre 0 et 1 et la durée doit être positive."); return; }
    setSaving(value.typeKey); setError(""); setNotice("");
    try { await updateAdminAmortissement({ ...draft, tauxAnnuel: Number(draft.tauxAnnuel), dureeAnnees: Number(draft.dureeAnnees) }); setAmortissements((current) => current.map((item) => item.typeKey === value.typeKey ? { ...draft, tauxAnnuel: Number(draft.tauxAnnuel), dureeAnnees: Number(draft.dureeAnnees) } : item)); setNotice(`${value.typeKey} a été enregistré.`); }
    catch (caught) { setError(formatError(caught)); if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login"); }
    finally { setSaving(null); }
  }

  if (loading) return <div role="status" className="admin-empty">Chargement des paramètres…</div>;
  return <section className="admin-page admin-settings">
    <AdminPageHeader title="Paramètres financiers" description="Valeurs utilisées par les calculs existants.">
      <button title="Actualiser" onClick={() => void load()} className="admin-button admin-button-secondary"><RefreshCw size={16} /> Actualiser</button>
    </AdminPageHeader>
    {error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}
    {notice && <div role="status" className="admin-notice admin-notice-success"><Check size={16} /> {notice}</div>}
    {Object.entries(groups).map(([group, entries]) => <section key={group} className="admin-card admin-setting-group" aria-label={displayGroup(group)}>
      <header className="admin-group-header"><h2><span className="admin-group-dot" />{displayGroup(group)}</h2>{GROUPS[group] && <p>{GROUPS[group].description}</p>}</header>
      {entries.map((setting) => {
        const arrayValues = arrayDrafts[setting.key] ?? parseAdminArraySetting(setting.value);
        const originalArray = parseAdminArraySetting(setting.value);
        const arrayChanged = arrayValues.length !== originalArray.length || arrayValues.some((item, index) => item !== originalArray[index]);
        const scalarValue = drafts[setting.key] ?? setting.value ?? "";
        const options = ADMIN_ARRAY_SETTING_OPTIONS[setting.key] ?? [];
        const validArray = arrayValues.length > 0 && arrayValues.every((item) => options.some((option) => option.value === item));
        const changed = setting.valueType === "arrays" ? arrayChanged && options.length > 0 && validArray : scalarValue !== (setting.value ?? "");
        return <div key={setting.key} className={`admin-setting-row ${setting.valueType === "arrays" ? "admin-setting-array" : ""}`}>
          <div className="admin-setting-label"><p>{setting.description || setting.key}</p><span>{setting.key} · {setting.valueType || "string"}</span></div>
          {setting.valueType === "arrays"
            ? options.length > 0
              ? <div className="admin-array-editor"><MultiSelect label={setting.key} options={options} value={arrayValues} onChange={(next) => setArrayDrafts((current) => ({ ...current, [setting.key]: next }))} />{arrayValues.length === 0 && <p role="alert" className="admin-field-warning">Sélectionnez au moins une valeur.</p>}</div>
              : <p role="alert" className="admin-field-warning">Aucun catalogue de valeurs n’est défini pour ce paramètre.</p>
            : <input aria-label={setting.key} type={setting.valueType === "number" || setting.valueType === "percentage" ? "number" : "text"} value={scalarValue} onChange={(event) => setDrafts((current) => ({ ...current, [setting.key]: event.target.value }))} className="admin-setting-input" />}
          <button title={`Enregistrer ${setting.key}`} disabled={saving === setting.key || !changed} onClick={() => void saveSetting(setting)} className="admin-button admin-button-primary admin-setting-save"><Save size={15} /> {saving === setting.key ? "Enregistrement…" : "Enregistrer"}</button>
        </div>;
      })}
    </section>)}
    <section className="admin-card admin-setting-group" aria-label="Amortissements">
      <header className="admin-group-header"><h2><span className="admin-group-dot" />Amortissements</h2><p>Taux au format décimal, par exemple 0,20 pour 20 %</p></header>
      {amortissements.map((item) => {
        const draft = amortDrafts[item.typeKey] || item;
        return <div key={item.typeKey} className="admin-setting-row admin-amortization-row">
          <div className="admin-setting-label"><p>{item.typeKey.replaceAll("_", " ")}</p><span>Taux annuel et durée</span></div>
          <label>Taux<input aria-label={`Taux ${item.typeKey}`} type="number" min="0" max="1" step="0.01" value={draft.tauxAnnuel} onChange={(event) => setAmortDrafts((current) => ({ ...current, [item.typeKey]: { ...draft, tauxAnnuel: Number(event.target.value) } }))} /></label>
          <label>Durée (années)<input aria-label={`Durée ${item.typeKey}`} type="number" min="1" step="1" value={draft.dureeAnnees} onChange={(event) => setAmortDrafts((current) => ({ ...current, [item.typeKey]: { ...draft, dureeAnnees: Number(event.target.value) } }))} /></label>
          <button title={`Enregistrer ${item.typeKey}`} disabled={saving === item.typeKey} onClick={() => void saveAmortissement(item)} className="admin-button admin-button-primary"><Save size={15} /> {saving === item.typeKey ? "Enregistrement…" : "Enregistrer"}</button>
        </div>;
      })}
    </section>
  </section>;
}
