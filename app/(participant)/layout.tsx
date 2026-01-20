import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF9] pb-20 md:pb-0">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#2D1E17]">My Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-3 md:hidden z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link href="/participant/dashboard" className="flex flex-col items-center space-y-1 text-[#E89D71]">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/participant/events" className="flex flex-col items-center space-y-1 text-[#6B5A4E]">
          <span className="text-xl">📅</span>
          <span className="text-[10px] font-bold">Events</span>
        </Link>
        <Link href="/participant/messages" className="flex flex-col items-center space-y-1 text-[#6B5A4E]">
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-bold">Inbox</span>
        </Link>
        <Link href="/participant/profile" className="flex flex-col items-center space-y-1 text-[#6B5A4E]">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
