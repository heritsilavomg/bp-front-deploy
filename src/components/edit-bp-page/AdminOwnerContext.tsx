"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { getAdminBusinessPlan } from "@/lib/adminBusinessPlanService";
import type { BusinessPlanOwnerSummary } from "@/types/adminBusinessPlan";

export default function AdminOwnerContext({ bpId, ownerId }: { bpId?: string; ownerId?: string }) {
  const { data: session } = useSession();
  const isForeignAdmin = Boolean(bpId && ownerId && session?.user.roles?.includes("ROLE_ADMIN") && session.user.id !== ownerId);
  const [owner, setOwner] = useState<BusinessPlanOwnerSummary | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setOwner(null);
    setError(false);
    if (!isForeignAdmin || !bpId) return;
    const controller = new AbortController();
    void getAdminBusinessPlan(bpId, controller.signal)
      .then(bp => { if (!controller.signal.aborted) setOwner(bp.owner); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [bpId, ownerId, isForeignAdmin]);
  if (!isForeignAdmin) return null;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
    <p className="min-w-0 break-words">Proprietaire : {owner ? `${owner.name || owner.id || "Indisponible"} - ${owner.email || "Email indisponible"}` : error ? "Informations indisponibles" : "Chargement..."}</p>
    <Link href="/admin/business-plans" className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300"><ArrowLeft size={16} />Business Plans</Link>
  </div>;
}
