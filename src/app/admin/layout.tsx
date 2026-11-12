import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { Montserrat } from "next/font/google";
import "./admin.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-admin-heading", display: "swap" });

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=%2Fadmin%2Fusers");
  if (!(session.user.roles || []).includes("ROLE_ADMIN")) redirect("/protected");

  return (
    <div className={`admin-shell ${montserrat.variable}`}>
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin/users" className="flex items-center gap-3 font-semibold">
            <span className="admin-brand-mark"><ShieldCheck size={19} /></span>
            Administration
          </Link>
          <div className="admin-account">
          <Link href="/protected" className="admin-return">
            <ArrowLeft size={16} /> Retour à l’application
          </Link>
          <span className="admin-avatar" title={session.user.name || session.user.email || "Administration"} aria-label="Compte administrateur">
            {(session.user.name || session.user.email || "Administration").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase()}
          </span>
          </div>
        </div>
      </header>
      <div className="admin-frame">
        <aside className="admin-sidebar">
          <AdminNavigation />
          <div className="admin-sidebar-footer"><LogoutButton className="admin-logout" /></div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
