import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#1A110D] text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Careable Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Executive View</Link>
          <Link href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">User Management</Link>
          <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Settings</Link>
        </nav>
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm font-medium text-red-400">Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-bold text-[#2D1E17]">Careable Admin</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
