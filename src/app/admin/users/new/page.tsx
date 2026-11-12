"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminUserForm, { AdminUserFormValues } from "../AdminUserForm";
import { createAdminUser } from "@/lib/adminUserService";

const initialValues: AdminUserFormValues = {
  email: "",
  nom: "",
  prenom: "",
  tel: "",
  dateNaissance: "",
  password: "",
  role: "ROLE_USER",
  status: "ACTIVE",
  emailVerified: true,
};

export default function NewAdminUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(values: AdminUserFormValues) {
    setSubmitting(true);
    setError("");
    try {
      await createAdminUser(values);
      router.push("/admin/users");
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(code === "CONFLICT" ? "Cet email est déjà utilisé." : code === "ACCESS_DENIED" ? "Action réservée aux administrateurs." : "Impossible de créer cet utilisateur.");
    } finally {
      setSubmitting(false);
    }
  }

  return <AdminUserForm mode="create" initialValues={initialValues} submitting={submitting} error={error} onSubmit={submit} />;
}
