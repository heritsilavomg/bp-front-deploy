"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Gauge, Settings, Users } from "lucide-react";

const entries = [
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/business-plans", label: "Business Plans", icon: FolderOpen },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
  { href: "/admin/scoring", label: "Scoring", icon: Gauge },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  return <>
    <div className="admin-sidebar-heading">
      <p>Plateforme SaaS</p>
      <strong>Console d’administration</strong>
    </div>
    <nav aria-label="Administration" className="admin-nav">{entries.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className="admin-nav-link"><Icon size={18} />{label}</Link>;
  })}</nav></>;
}
