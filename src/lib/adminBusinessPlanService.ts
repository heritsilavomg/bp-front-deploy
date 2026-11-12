import type { AdminBusinessPlanPage, AdminBusinessPlanQuery, AdminBusinessPlanSummary } from "@/types/adminBusinessPlan";

async function read<T>(response: Response): Promise<T> {
  if (response.status === 401) throw new Error("SESSION_EXPIRED");
  if (response.status === 403) throw new Error("ACCESS_DENIED");
  if (response.status === 404) throw new Error("NOT_FOUND");
  if (!response.ok) throw new Error(`REQUEST_FAILED_${response.status}`);
  return response.json() as Promise<T>;
}

export async function getAdminBusinessPlans(query: AdminBusinessPlanQuery, signal?: AbortSignal): Promise<AdminBusinessPlanPage> {
  const params = new URLSearchParams({ page: String(query.page), size: String(query.size) });
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  return read(await fetch(`/api/admin/business-plans?${params}`, { cache: "no-store", signal }));
}

export async function getAdminBusinessPlan(id: string, signal?: AbortSignal): Promise<AdminBusinessPlanSummary> {
  return read(await fetch(`/api/admin/business-plans/${encodeURIComponent(id)}`, { cache: "no-store", signal }));
}
