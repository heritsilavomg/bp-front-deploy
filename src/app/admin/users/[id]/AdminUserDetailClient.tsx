"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { deleteAdminUser, getAdminUser, updateAdminUserStatus } from "@/lib/adminUserService";
import type { AdminUserSummary, UserStatus } from "@/types/admin";
import { RoleBadge, StatusBadge } from "@/components/admin/StatusBadge";

const BACK = { href: "/admin/users", label: "Retour aux utilisateurs" };

function initials(user: AdminUserSummary) {
  return [user.prenom, user.nom].map((part) => part?.trim()?.[0]).filter(Boolean).join("").toUpperCase() || user.email[0]?.toUpperCase() || "?";
}

export default function AdminUserDetailClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAdminUser(id)
      .then(setUser)
      .catch((caught: unknown) => {
        const code = caught instanceof Error ? caught.message : "";
        if (code === "SESSION_EXPIRED") router.push("/login");
        else setError(code === "NOT_FOUND" ? "Utilisateur introuvable." : "Impossible de charger cet utilisateur.");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function toggle() {
    if (!user) return;
    const next: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (next === "SUSPENDED" && !window.confirm("Voulez-vous vraiment suspendre cet utilisateur ?")) return;
    setUpdating(true);
    setError("");
    try {
      setUser(await updateAdminUserStatus(id, next));
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      if (code === "SESSION_EXPIRED") router.push("/login");
      else setError(code === "CONFLICT" ? "Cette opération est refusée par une protection métier." : "Le statut n'a pas pu être modifié.");
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    if (!user || !window.confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action peut être irréversible.")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAdminUser(id);
      router.push("/admin/users");
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      if (code === "SESSION_EXPIRED") router.push("/login");
      else setError(code === "CONFLICT" ? "La suppression est impossible car des données sont encore liées." : "L'utilisateur n'a pas pu être supprimé.");
      setDeleting(false);
    }
  }

  if (loading) return <div role="status" className="admin-empty">Chargement de l’utilisateur…</div>;
  if (!user) return <section className="admin-page admin-narrow">
    <AdminPageHeader back={BACK} title="Détail utilisateur" />
    <div role="alert" className="admin-notice admin-notice-error">{error}</div>
  </section>;

  const self = user.id === session?.user?.id;
  return <section className="admin-page admin-narrow">
    <AdminPageHeader back={BACK} title="Détail utilisateur" description="Informations administratives non sensibles." />
    {error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}
    <div className="admin-card">
      <div className="admin-detail-header">
        <div className="admin-identity">
          <span className="admin-identity-avatar" aria-hidden="true">{initials(user)}</span>
          <div className="min-w-0">
            <h2>{user.prenom} {user.nom}</h2>
            <p className="admin-cell-secondary">{user.email}</p>
          </div>
        </div>
        <div className="admin-badges"><RoleBadge role={user.role} /><StatusBadge status={user.status} /></div>
      </div>
      <dl className="admin-definitions">
        <Info label="Téléphone" value={user.tel} />
        <Info label="Date de naissance" value={user.dateNaissance} />
        <Info label="Email vérifié" value={user.emailVerified ? "Oui" : "Non"} />
      </dl>
      <div className="admin-card-actions">
        <button disabled={deleting || self} onClick={() => void remove()} title={self ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"} className="admin-button admin-button-danger"><Trash2 size={16} /> Supprimer</button>
        <Link href={`/admin/users/${id}/edit`} className="admin-button admin-button-secondary"><Pencil size={16} /> Modifier</Link>
        <button disabled={updating || (self && user.status === "ACTIVE")} title={self && user.status === "ACTIVE" ? "Vous ne pouvez pas suspendre votre propre compte" : undefined} onClick={() => void toggle()} className="admin-button admin-button-primary">{user.status === "ACTIVE" ? <UserX size={16} /> : <UserCheck size={16} />}{user.status === "ACTIVE" ? "Suspendre" : "Réactiver"}</button>
      </div>
    </div>
  </section>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div><dt>{label}</dt><dd>{value || "Non renseigné"}</dd></div>;
}
