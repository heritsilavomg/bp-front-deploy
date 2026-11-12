"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { UserRole, UserStatus } from "@/types/admin";

export type AdminUserFormValues = {
  email: string;
  nom: string;
  prenom: string;
  tel: string;
  dateNaissance: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

type Props = {
  mode: "create" | "edit";
  initialValues: AdminUserFormValues;
  submitting: boolean;
  error: string;
  onSubmit: (values: AdminUserFormValues) => Promise<void>;
};

export default function AdminUserForm({ mode, initialValues, submitting, error, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues);
  const [localError, setLocalError] = useState("");

  function update(field: keyof AdminUserFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "create" && values.password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLocalError("");
    await onSubmit(values);
  }

  return (
    <section className="admin-page admin-narrow">
      <AdminPageHeader
        back={{ href: "/admin/users", label: "Retour aux utilisateurs" }}
        title={mode === "create" ? "Ajouter un utilisateur" : "Modifier un utilisateur"}
        description="Les champs sensibles sont contrôlés par le backend."
      />
      {(error || localError) && <div role="alert" className="admin-notice admin-notice-error">{error || localError}</div>}
      <form onSubmit={submit} className="admin-card admin-form-card">
        <div className="admin-form-grid">
          <Field label="Email" type="email" value={values.email} required onChange={(value) => update("email", value)} />
          <Field label="Téléphone" value={values.tel} onChange={(value) => update("tel", value)} />
          <Field label="Nom" value={values.nom} required onChange={(value) => update("nom", value)} />
          <Field label="Prénom" value={values.prenom} required onChange={(value) => update("prenom", value)} />
          <Field label="Date de naissance" type="date" value={values.dateNaissance} onChange={(value) => update("dateNaissance", value)} />
          {mode === "create" && <Field label="Mot de passe initial" type="password" value={values.password} required onChange={(value) => update("password", value)} />}
          <label className="admin-field">
            <span>Rôle</span>
            <select value={values.role} onChange={(event) => update("role", event.target.value)}>
              <option value="ROLE_USER">USER</option>
              <option value="ROLE_ADMIN">ADMIN</option>
            </select>
          </label>
          <label className="admin-field">
            <span>Statut</span>
            <select value={values.status} onChange={(event) => update("status", event.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={values.emailVerified} onChange={(event) => update("emailVerified", event.target.checked)} />
            Email vérifié
          </label>
        </div>
        <div className="admin-card-actions">
          <Link href="/admin/users" className="admin-button admin-button-secondary">Annuler</Link>
          <button type="submit" disabled={submitting} className="admin-button admin-button-primary">
            <Save size={16} /> {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, value, type = "text", required = false, onChange }: { label: string; value: string; type?: string; required?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
