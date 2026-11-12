"use client";

import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, RefreshCw, Search } from "lucide-react";
import { getAdminBusinessPlans } from "@/lib/adminBusinessPlanService";
import { BUSINESS_PLAN_STATUSES, type AdminBusinessPlanPage, type BusinessPlanStatus } from "@/types/adminBusinessPlan";

const STATUS_LABELS: Record<BusinessPlanStatus, string> = {
  BROUILLON: "Brouillon", EN_COURS: "En cours", VALIDE: "Validé", REJETE: "Rejeté",
};

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "Non renseignée";
}

export default function AdminBusinessPlans() {
  const [data, setData] = useState<AdminBusinessPlanPage | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BusinessPlanStatus | "">("");
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(0); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void getAdminBusinessPlans({ page, size: 20, search: query, status: status || undefined }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        const code = caught instanceof Error ? caught.message : "";
        setError(code === "ACCESS_DENIED" ? "Accès réservé aux administrateurs." : code === "SESSION_EXPIRED"
          ? "Votre session a expiré. Veuillez vous reconnecter." : "Impossible de charger les Business Plans.");
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, query, status, refresh]);

  return <section className="admin-page admin-plans">
    <AdminPageHeader title="Business Plans" description="Consultez et ouvrez les Business Plans de tous les utilisateurs.">
      <button title="Actualiser" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="admin-button admin-button-secondary"><RefreshCw size={16} className={loading ? "animate-spin" : undefined} /> Actualiser</button>
    </AdminPageHeader>
    <div className="admin-filters admin-plan-filters">
      <label className="admin-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Rechercher un BP ou un propriétaire</span>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Titre, nom ou email du propriétaire" /></label>
      <select aria-label="Filtrer par statut" value={status} onChange={event => { setStatus(event.target.value as BusinessPlanStatus | ""); setPage(0); }}>
        <option value="">Tous les statuts</option>{BUSINESS_PLAN_STATUSES.map(code => <option key={code} value={code}>{STATUS_LABELS[code]}</option>)}
      </select>
    </div>
    {error && <p role="alert" className="admin-notice admin-notice-error">{error}</p>}
    <div className="admin-card admin-table-card" aria-busy={loading}>
      {loading ? <p role="status" className="admin-empty">Chargement des Business Plans…</p> : !error && <>
        {!data?.content.length ? <p className="admin-empty">Aucun Business Plan trouvé.</p> :
          <div className="admin-table-scroll" role="region" aria-label="Liste des Business Plans" tabIndex={0}>
            <table className="admin-table admin-plans-table"><thead><tr>
              <th>Business Plan</th><th>Propriétaire</th><th>Statut</th><th>Création</th><th>Modification</th><th className="admin-actions-heading">Actions</th>
            </tr></thead><tbody>{data.content.map(bp => <tr key={bp.id}>
              <td><Link href={`/protected/edit-bp/${encodeURIComponent(bp.id)}`} className={bp.title ? "admin-plan-title" : "admin-untitled"}>{bp.title || "Sans titre"}</Link></td>
              <td><p>{bp.owner.name || "Propriétaire indisponible"}</p><p className="admin-cell-secondary">{bp.owner.email || "Email indisponible"}</p></td>
              <td><span className={`admin-badge admin-plan-status-${bp.status || "unknown"}`}>{bp.status ? STATUS_LABELS[bp.status] : "Non renseigné"}</span></td>
              <td className="admin-date">{date(bp.createdAt)}</td><td className="admin-date">{date(bp.updatedAt)}</td>
              <td><div className="admin-row-actions"><Link title="Ouvrir dans l’éditeur" aria-label={`Modifier ${bp.title || "le Business Plan"}`} href={`/protected/edit-bp/${encodeURIComponent(bp.id)}`} className="admin-icon-button"><Pencil size={17} /></Link></div></td>
            </tr>)}</tbody></table>
          </div>}
        {data && <footer className="admin-pagination admin-plan-pagination">
          <span>Affichage de {data.totalElements ? data.page * data.size + 1 : 0} à {Math.min((data.page + 1) * data.size, data.totalElements)} sur {data.totalElements} résultats</span>
          <div className="admin-pagination-controls">
            <button title="Page précédente" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="admin-button admin-button-secondary"><ChevronLeft size={15} /><span>Précédent</span></button>
            <span className="admin-current-page" aria-label={`Page ${data.page + 1} sur ${Math.max(1, data.totalPages)}`}>{data.page + 1}</span>
            <button title="Page suivante" disabled={page + 1 >= data.totalPages} onClick={() => setPage(value => value + 1)} className="admin-button admin-button-secondary"><span>Suivant</span><ChevronRight size={15} /></button>
          </div>
        </footer>}
      </>}
    </div>
  </section>;
}
