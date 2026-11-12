import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPageHeader({ title, description, back, children }: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return <>
    {back && <Link href={back.href} className="admin-back-link"><ArrowLeft size={16} /> {back.label}</Link>}
    <header className="admin-page-header">
      <div>
        <p className="admin-eyebrow">Administration</p>
        <h1>{title}</h1>
        {description && <p className="admin-description">{description}</p>}
      </div>
      {children && <div className="admin-header-actions">{children}</div>}
    </header>
  </>;
}
