"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserForm, { AdminUserFormValues } from "../../AdminUserForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getAdminUser, updateAdminUser } from "@/lib/adminUserService";
import type { AdminUserUpdateRequest } from "@/types/admin";

export default function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [values, setValues] = useState<AdminUserFormValues | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      getAdminUser(resolvedId).then((user) => {
        if (active) setValues({ email: user.email, nom: user.nom || "", prenom: user.prenom || "", tel: user.tel || "", dateNaissance: user.dateNaissance || "", password: "", role: user.role || "ROLE_USER", status: user.status || "ACTIVE", emailVerified: user.emailVerified ?? false });
      }).catch((caught: unknown) => { if (active) setError(caught instanceof Error && caught.message === "NOT_FOUND" ? "Utilisateur introuvable." : "Impossible de charger cet utilisateur."); });
    });
    return () => { active = false; };
  }, [params]);

  async function submit(nextValues: AdminUserFormValues) {
    setSubmitting(true);
    setError("");
    try {
      const payload: AdminUserUpdateRequest = {
        email: nextValues.email,
        nom: nextValues.nom,
        prenom: nextValues.prenom,
        tel: nextValues.tel,
        dateNaissance: nextValues.dateNaissance,
        role: nextValues.role,
        status: nextValues.status,
        emailVerified: nextValues.emailVerified,
      };
      await updateAdminUser(id, payload);
      router.push(`/admin/users/${encodeURIComponent(id)}`);
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(code === "CONFLICT" ? "Cet email est déjà utilisé ou la modification est protégée." : code === "ACCESS_DENIED" ? "Cette modification est protégée." : "Impossible de modifier cet utilisateur.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!values && error) return <section className="admin-page admin-narrow">
    <AdminPageHeader back={{ href: "/admin/users", label: "Retour aux utilisateurs" }} title="Modifier un utilisateur" />
    <div role="alert" className="admin-notice admin-notice-error">{error}</div>
  </section>;
  if (!values) return <div role="status" className="admin-empty">Chargement de l’utilisateur…</div>;
  return <AdminUserForm mode="edit" initialValues={values} submitting={submitting} error={error} onSubmit={submit} />;
}
