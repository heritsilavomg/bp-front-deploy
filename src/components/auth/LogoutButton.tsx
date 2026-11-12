"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className }: { className?: string } = {}) {
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className || "cursor-pointer px-4 py-2 bg-red-500/50 hover:bg-red-600 text-white/90 rounded-lg transition-colors"}
    >
      {className && <LogOut size={18} aria-hidden="true" />} Déconnexion
    </button>
  );
}
