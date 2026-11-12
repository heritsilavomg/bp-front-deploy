export const BUSINESS_PLAN_STATUSES = ["BROUILLON", "EN_COURS", "VALIDE", "REJETE"] as const;
export type BusinessPlanStatus = (typeof BUSINESS_PLAN_STATUSES)[number];
export type BusinessPlanOwnerSummary = { id: string | null; name: string | null; email: string | null };
export type AdminBusinessPlanSummary = {
  id: string;
  title: string | null;
  owner: BusinessPlanOwnerSummary;
  status: BusinessPlanStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
};
export type AdminBusinessPlanPage = {
  content: AdminBusinessPlanSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
export type AdminBusinessPlanQuery = { page: number; size: number; search?: string; status?: BusinessPlanStatus };
