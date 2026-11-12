"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Calculator, Check, Gauge, Info, ListChecks, RefreshCw, Save } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useRouter } from "next/navigation";
import { getScoringConfiguration, updateScoringConfiguration } from "@/lib/adminScoringService";
import { SCORING_DIMENSIONS, type ScoringConfiguration, type ScoringDimensionCode } from "@/types/scoring";

const DIMENSION_DETAILS: Record<ScoringDimensionCode, { label: string; description: string }> = {
  FINANCIAL_VIABILITY: { label: "Viabilité financière", description: "Mois avec une trésorerie de clôture positive ou nulle." },
  FINANCING_STRUCTURE: { label: "Structure de financement", description: "Couverture des besoins de démarrage par les ressources de trésorerie." },
  PROFITABILITY: { label: "Rentabilité prévisionnelle", description: "Années avec EBE et résultat net positifs." },
  MARKET_COMMERCIAL: { label: "Préparation commerciale", description: "Offres, clients, concurrents, canaux et prévisions renseignés." },
  RISK_PREPAREDNESS: { label: "Préparation aux risques", description: "Risques, solutions aux contraintes et plan d'urgence documentés." },
};

type Drafts = Record<ScoringDimensionCode, string>;

function formatError(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "SESSION_EXPIRED") return "Votre session a expiré. Veuillez vous reconnecter.";
  if (code === "ACCESS_DENIED") return "Vous n'avez pas les droits pour modifier cette configuration.";
  if (code === "INVALID_CONFIGURATION") return "Les cinq dimensions doivent totaliser exactement 100 %.";
  return "Impossible de charger ou d'enregistrer la configuration.";
}

function toDraft(configuration: ScoringConfiguration): Drafts {
  return Object.fromEntries(SCORING_DIMENSIONS.map((code) => {
    const item = configuration.dimensions.find((dimension) => dimension.dimensionCode === code);
    return [code, item == null ? "" : String(item.weight)];
  })) as Drafts;
}

export default function AdminScoringClient() {
  const router = useRouter();
  const [configuration, setConfiguration] = useState<ScoringConfiguration | null>(null);
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const current = await getScoringConfiguration();
      setConfiguration(current);
      setDrafts(toDraft(current));
    } catch (caught) {
      setError(formatError(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const validation = useMemo(() => {
    if (!drafts) return { total: 0, valid: false, changed: false };
    const values = SCORING_DIMENSIONS.map((code) => drafts[code].trim() === "" ? null : Number(drafts[code]));
    const allPresent = values.every((value) => value !== null && Number.isFinite(value));
    const inRange = values.every((value) => value !== null && value >= 0 && value <= 100);
    const supportedPrecision = SCORING_DIMENSIONS.every((code) => /^\d+(?:\.\d{0,2})?$/.test(drafts[code].trim()));
    const cents = values.reduce<number>((sum, value) => sum + (value === null || !Number.isFinite(value) ? 0 : Math.round(value * 100)), 0);
    const original = configuration ? toDraft(configuration) : null;
    const changed = original !== null && SCORING_DIMENSIONS.some((code) => Number(drafts[code]) !== Number(original[code]));
    return { total: cents / 100, valid: allPresent && inRange && supportedPrecision && cents === 10000, changed };
  }, [configuration, drafts]);

  async function save() {
    if (saving || !drafts || !validation.valid || !validation.changed) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateScoringConfiguration({
        dimensions: SCORING_DIMENSIONS.map((dimensionCode) => ({ dimensionCode, weight: Number(drafts[dimensionCode]) })),
        totalWeight: 100,
      });
      setConfiguration(updated);
      setDrafts(toDraft(updated));
      setNotice("La configuration du scoring a été enregistrée.");
    } catch (caught) {
      setError(formatError(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div role="status" className="admin-empty">Chargement du scoring…</div>;

  const saveDisabled = saving || !validation.valid || !validation.changed;

  return <section className="admin-page admin-scoring">
    <AdminPageHeader title="Pondérations du scoring" description="Définissez la répartition des coefficients pour l’évaluation globale des Business Plans.">
      <button type="button" title="Actualiser" disabled={saving} onClick={() => void load()} className="admin-button admin-button-secondary"><RefreshCw size={16} /> Actualiser</button>
      <button type="button" disabled={saveDisabled} onClick={() => void save()} className="admin-button admin-button-primary"><Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer les pondérations"}</button>
    </AdminPageHeader>
    {error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}
    {notice && <div role="status" className="admin-notice admin-notice-success"><Check size={16} />{notice}</div>}

    <div className="admin-card admin-scoring-card">
      <div className="admin-score-summary" aria-live="polite">
        <span className="admin-score-summary-icon"><BadgeCheck size={23} /></span>
        <div className="admin-score-summary-copy">
          <div className="admin-score-total"><h2>Total des pondérations :</h2><strong className={validation.valid ? "admin-valid" : "admin-warning"}>{validation.total.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %</strong>
            <span className={`admin-badge ${validation.valid ? "admin-badge-active" : "admin-badge-warning"}`}>{validation.valid && <Check size={14} />}{validation.valid ? "Valide (Total = 100%)" : "Configuration à corriger"}</span>
          </div>
          <p>La somme exacte de l’ensemble des {SCORING_DIMENSIONS.length} dimensions doit totaliser 100 %.</p>
          {!validation.valid && <p className="admin-field-warning">Poids entre 0 et 100, deux décimales maximum, total requis : 100 %.</p>}
        </div>
        <div className="admin-weight-distribution" aria-label="Répartition des pondérations">
          <div className="admin-distribution-heading"><span>Répartition active</span><span>{configuration?.dimensions.length ?? 0}/{SCORING_DIMENSIONS.length} dimensions configurées</span></div>
          <div className="admin-distribution-track" aria-hidden="true">{SCORING_DIMENSIONS.map((code, index) => <span key={code} title={`${DIMENSION_DETAILS[code].label} : ${drafts?.[code] || "—"} %`} className={`admin-distribution-segment admin-segment-${index + 1}`} style={{ width: validation.valid ? `${Number(drafts?.[code] ?? 0)}%` : "0%" }} />)}</div>
          <ul className="admin-distribution-legend">{SCORING_DIMENSIONS.map((code, index) => <li key={code}>
            <span className={`admin-legend-swatch admin-segment-${index + 1}`} aria-hidden="true" />
            <span className="admin-legend-label">{DIMENSION_DETAILS[code].label}</span>
            <strong>{drafts?.[code]?.trim() ? `${drafts[code]} %` : "—"}</strong>
          </li>)}</ul>
        </div>
      </div>
      {SCORING_DIMENSIONS.map((code, index) => <div key={code} className="admin-score-row">
        <span className={`admin-dimension-number admin-dimension-${index + 1}`}>{index + 1}</span>
        <div className="admin-dimension-content">
          <div className="admin-dimension-heading"><h2>{DIMENSION_DETAILS[code].label}</h2><code>{code}</code></div>
          <p>{DIMENSION_DETAILS[code].description}</p>
        </div>
        <div className="admin-score-controls"><label className="admin-score-input">
          <span className="sr-only">Poids {DIMENSION_DETAILS[code].label}</span>
          <input aria-label={`Poids ${DIMENSION_DETAILS[code].label}`} type="number" min="0" max="100" step="0.01"
            value={drafts?.[code] ?? ""} disabled={saving}
            onChange={(event) => setDrafts((current) => current ? { ...current, [code]: event.target.value } : current)} />
          <span aria-hidden="true">%</span>
        </label>
        <output className="admin-weight-decimal" aria-label={`Coefficient ${DIMENSION_DETAILS[code].label}`}>{drafts?.[code]?.trim() && Number.isFinite(Number(drafts[code])) ? (Number(drafts[code]) / 100).toFixed(2) : "—"}</output></div>
      </div>)}
      <footer className="admin-score-footer">
        <p><Info size={18} />Les scores ne sont pas stockés : une nouvelle pondération s’applique dès la prochaine évaluation de chaque Business Plan.</p>
        <button type="button" disabled={saveDisabled} onClick={() => void save()} className="admin-button admin-button-primary"><Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer"}</button>
      </footer>
    </div>

    {/* Rules mirrored from bp-back BusinessPlanScoringService; descriptive only. */}
    <div className="admin-info-grid">
      <article className="admin-card admin-info-card">
        <span className="admin-info-icon" aria-hidden="true"><Calculator size={20} /></span>
        <h2>Formule de calcul</h2>
        <p className="admin-formula">Score global = Σ (score × pondération) ÷ Σ pondérations évaluables</p>
        <p>Chaque dimension est notée sur 100. Une dimension non évaluable est exclue du calcul : elle ne compte pas comme un zéro.</p>
      </article>
      <article className="admin-card admin-info-card">
        <span className="admin-info-icon admin-info-icon-teal" aria-hidden="true"><ListChecks size={20} /></span>
        <h2>Statut de l’évaluation</h2>
        <ul>
          <li><strong>Complète</strong> : les trois dimensions financières sont évaluables.</li>
          <li><strong>Provisoire</strong> : au moins une dimension financière n’est pas évaluable.</li>
          <li><strong>Incomplète</strong> : couverture inférieure à 60 %, aucun score global n’est calculé.</li>
        </ul>
      </article>
      <article className="admin-card admin-info-card">
        <span className="admin-info-icon admin-info-icon-warm" aria-hidden="true"><Gauge size={20} /></span>
        <h2>Interprétation du score</h2>
        <ul>
          <li><strong>Moins de 40</strong> : points critiques</li>
          <li><strong>40 à moins de 60</strong> : à renforcer</li>
          <li><strong>60 à moins de 80</strong> : encourageant</li>
          <li><strong>80 et plus</strong> : solide</li>
        </ul>
      </article>
    </div>
  </section>;
}
