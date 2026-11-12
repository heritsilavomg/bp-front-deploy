import type { AdminUserCreateRequest, AdminUserPage, AdminUserQuery, AdminUserSummary, AdminUserUpdateRequest, UserStatus } from "@/types/admin";

async function readError(response: Response): Promise<Error> {
  if (response.status === 401) return new Error("SESSION_EXPIRED");
  if (response.status === 403) return new Error("ACCESS_DENIED");
  if (response.status === 404) return new Error("NOT_FOUND");
  if (response.status === 409) return new Error("CONFLICT");
  return new Error(`REQUEST_FAILED_${response.status}`);
}

export async function getAdminUsers(query: AdminUserQuery): Promise<AdminUserPage> {
  const params = new URLSearchParams({ page: String(query.page), size: String(query.size), sort: query.sort || "email,asc" });
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.role) params.set("role", query.role);
  const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AdminUserPage>;
}

export async function getAdminUser(id: string): Promise<AdminUserSummary> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AdminUserSummary>;
}

export async function updateAdminUserStatus(id: string, status: UserStatus): Promise<AdminUserSummary> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AdminUserSummary>;
}

export async function createAdminUser(payload: AdminUserCreateRequest): Promise<AdminUserSummary> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AdminUserSummary>;
}

export async function updateAdminUser(id: string, payload: AdminUserUpdateRequest): Promise<AdminUserSummary> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response);
  return response.json() as Promise<AdminUserSummary>;
}

export async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw await readError(response);
}
