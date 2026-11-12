import type { UserStatus } from "@/types/admin";

export function StatusBadge({ status }: { status?: UserStatus }) {
  const active = status === "ACTIVE";
  return <span className={`admin-badge ${active ? "admin-badge-active" : "admin-badge-warning"}`}>{status || "INCONNU"}</span>;
}

export function RoleBadge({ role }: { role?: string }) {
  return <span className={`admin-badge ${role === "ROLE_ADMIN" ? "admin-badge-admin" : ""}`}>{role === "ROLE_ADMIN" ? "ADMIN" : "USER"}</span>;
}
