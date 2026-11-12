"use client";

import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Search, Trash2, UserCheck, UserPlus, UserX } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { deleteAdminUser, getAdminUsers, updateAdminUserStatus } from "@/lib/adminUserService";
import type { AdminUserPage, UserRole, UserStatus } from "@/types/admin";
import { RoleBadge, StatusBadge } from "@/components/admin/StatusBadge";

const PAGE_SIZE = 20;

function errorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "SESSION_EXPIRED") return "Votre session a expiré. Veuillez vous reconnecter.";
  if (code === "ACCESS_DENIED") return "Vous n'avez pas accès à cette section.";
  if (code === "CONFLICT") return "Cette opération est refusée par une protection métier.";
  return "Impossible de traiter les utilisateurs. Réessayez dans un instant.";
}

export default function AdminUsersClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminUserPage | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [role, setRole] = useState<UserRole | "">("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); setQuery(search.trim()); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getAdminUsers({ page, size: PAGE_SIZE, search: query, status: status || undefined, role: role || undefined, sort: "email,asc" }));
    } catch (caught) {
      setError(errorMessage(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [page, query, role, router, status]);

  useEffect(() => { void load(); }, [load]);

  async function toggleStatus(id: string, current?: UserStatus) {
    const next: UserStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (next === "SUSPENDED" && !window.confirm("Voulez-vous vraiment suspendre cet utilisateur ?")) return;
    setUpdatingId(id);
    setError("");
    try {
      await updateAdminUserStatus(id, next);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action peut être irréversible.")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteAdminUser(id);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
      if (caught instanceof Error && caught.message === "SESSION_EXPIRED") router.push("/login");
    } finally {
      setDeletingId(null);
    }
  }

  const currentUserId = session?.user?.id;
  const rangeStart = data && data.totalElements > 0 ? data.page * data.size + 1 : 0;
  const rangeEnd = data ? Math.min((data.page + 1) * data.size, data.totalElements) : 0;
  const emptyLabel = query || status || role ? "Aucun résultat pour ces critères." : "Aucun utilisateur trouvé.";
  const pages = useMemo(() => data ? data.totalPages : 0, [data]);

  return <section className="admin-page admin-users">
    <AdminPageHeader title="Utilisateurs" description="Gérez les accès et le statut des comptes." />
    <div className="admin-card admin-filters admin-user-filters">
      <label className="admin-search">
        <Search size={17} aria-hidden="true" /><span className="sr-only">Rechercher</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par email, nom ou téléphone" />
      </label>
      <select aria-label="Filtrer par statut" value={status} onChange={(event) => { setStatus(event.target.value as UserStatus | ""); setPage(0); }}>
        <option value="">Tous les statuts</option><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option>
      </select>
      <select aria-label="Filtrer par rôle" value={role} onChange={(event) => { setRole(event.target.value as UserRole | ""); setPage(0); }}>
        <option value="">Tous les rôles</option><option value="ROLE_USER">USER</option><option value="ROLE_ADMIN">ADMIN</option>
      </select>
      <Link href="/admin/users/new" className="admin-button admin-button-primary"><UserPlus size={16} /> Ajouter</Link>
    </div>
    {error && <div role="alert" className="admin-notice admin-notice-error">{error}</div>}
    <div className="admin-card admin-table-card" aria-busy={loading}>
      {loading ? <div role="status" className="admin-empty">Chargement des utilisateurs…</div> : data?.content.length ?
        <div className="admin-table-scroll" role="region" aria-label="Liste des utilisateurs" tabIndex={0}>
          <table className="admin-table admin-users-table">
            <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th className="admin-actions-heading">Actions</th></tr></thead>
            <tbody>{data.content.map((user) => <tr key={user.id}>
              <td><div className="admin-user-name">{user.prenom} {user.nom}</div><div className="admin-cell-secondary">{user.email}</div></td>
              <td><RoleBadge role={user.role} /></td><td><StatusBadge status={user.status} /></td>
              <td><Actions user={user} currentUserId={currentUserId} updatingId={updatingId} deletingId={deletingId} onToggle={toggleStatus} onDelete={deleteUser} /></td>
            </tr>)}</tbody>
          </table>
        </div> : <div className="admin-empty">{emptyLabel}</div>}
      {data && <div className="admin-pagination">
        <span>{rangeStart}-{rangeEnd} sur {data.totalElements} utilisateurs</span>
        <div className="admin-pagination-controls">
          <button title="Page précédente" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)} className="admin-button admin-button-secondary admin-pagination-arrow"><ChevronLeft size={17} /></button>
          <span>Page {data.page + 1} / {Math.max(pages, 1)}</span>
          <button title="Page suivante" disabled={page + 1 >= pages || loading} onClick={() => setPage((value) => value + 1)} className="admin-button admin-button-secondary admin-pagination-arrow"><ChevronRight size={17} /></button>
        </div>
      </div>}
    </div>
  </section>;
}

function Actions({ user, currentUserId, updatingId, deletingId, onToggle, onDelete }: { user: AdminUserPage["content"][number]; currentUserId?: string; updatingId: string | null; deletingId: string | null; onToggle: (id: string, status?: UserStatus) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const self = user.id === currentUserId;
  return <div className="admin-row-actions"><Link title="Consulter" aria-label={`Consulter ${user.email}`} href={`/admin/users/${user.id}`} className="admin-icon-button"><Eye size={17} /></Link><Link title="Modifier" aria-label={`Modifier ${user.email}`} href={`/admin/users/${user.id}/edit`} className="admin-icon-button"><Pencil size={17} /></Link><button title={self && user.status === "ACTIVE" ? "Vous ne pouvez pas suspendre votre propre compte" : user.status === "ACTIVE" ? "Suspendre" : "Réactiver"} disabled={updatingId === user.id || (self && user.status === "ACTIVE")} onClick={() => void onToggle(user.id, user.status)} className="admin-icon-button">{user.status === "ACTIVE" ? <UserX size={17} /> : <UserCheck size={17} />}</button><button title={self ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"} disabled={deletingId === user.id || self} onClick={() => void onDelete(user.id)} className="admin-icon-button admin-icon-danger"><Trash2 size={17} /></button></div>;
}

