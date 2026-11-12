import type { AdminAmortissement, AdminSetting } from "@/types/adminSettings";

async function assertOk(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 401) throw new Error("SESSION_EXPIRED");
  if (response.status === 403) throw new Error("ACCESS_DENIED");
  if (response.status === 400) throw new Error("INVALID_VALUE");
  if (response.status === 404) throw new Error("NOT_FOUND");
  throw new Error(`REQUEST_FAILED_${response.status}`);
}

export async function getAdminSettings(): Promise<AdminSetting[]> {
  const response = await fetch("/api/bp/config", { cache: "no-store" });
  await assertOk(response);
  return response.json() as Promise<AdminSetting[]>;
}

export async function updateAdminSetting(setting: AdminSetting): Promise<void> {
  const response = await fetch(`/api/bp/config/${encodeURIComponent(setting.key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(setting),
  });
  await assertOk(response);
}

export function parseAdminArraySetting(value?: string): string[] {
  return [...new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean))];
}

export async function updateAdminArraySetting(setting: AdminSetting, values: string[]): Promise<void> {
  const uniqueValues = [...new Set(values.map((item) => item.trim()).filter(Boolean))];
  await updateAdminSetting({ ...setting, value: uniqueValues.join(",") });
}

export async function getAdminAmortissements(): Promise<AdminAmortissement[]> {
  const response = await fetch("/api/bp/amortissement", { cache: "no-store" });
  await assertOk(response);
  return response.json() as Promise<AdminAmortissement[]>;
}

export async function updateAdminAmortissement(value: AdminAmortissement): Promise<void> {
  const response = await fetch(`/api/bp/amortissement/${encodeURIComponent(value.typeKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  await assertOk(response);
}
