import { auth } from "@/auth";
import { redirect } from "next/navigation";

type BusinessPlanSummary = {
  id: string;
};

function isBusinessPlanSummary(value: unknown): value is BusinessPlanSummary {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string"
  );
}

function extractBusinessPlans(payload: unknown): BusinessPlanSummary[] | null {
  const candidate = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : null;

  if (!Array.isArray(candidate) || !candidate.every(isBusinessPlanSummary)) {
    return null;
  }

  return candidate;
}

export default async function ProtectedPage() {
  const session = await auth();
  const expires = session?.expires ? new Date(session.expires) : new Date(0, 0, 0);
  const isLoggedIn = !!session && expires > new Date();

  if (!isLoggedIn) {
    redirect("/login");
  }

  const backendUrl = (process.env.SPRING_BOOT_API || "http://localhost:8080").replace(/\/+$/, "");
  const response = await fetch(`${backendUrl}/bp`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.toLowerCase().includes("application/json")) {
    throw new Error(`Unable to load Business Plans (HTTP ${response.status}).`);
  }

  const data = extractBusinessPlans(await response.json());
  if (!data) {
    throw new Error("The Business Plan API returned an unexpected response shape.");
  }

  if (data.length === 0) {
    redirect("/protected/new");
  } else if (data.length === 1) {
    redirect(`/protected/edit-bp/${data[0].id}`);
  } else {
    redirect("/protected/list-bp");
  }
}
