'use client';

import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Ticket, User, Users } from 'lucide-react';
import { PreferenceToggles } from '@/components/PreferenceToggles';
import { useTranslations } from '@/components/PreferencesProvider';
import { useUserRole } from '@/hooks/useUserRole';

export default function PortalClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const { role, theme, isCaregiver } = useUserRole();

  // Apply role-based theme to document root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-role', role);
  }, [role]);

  // Define navigation items based on role
  const navItems = React.useMemo(() => {
    const baseItems = [
      { href: '/portal/dashboard', icon: Home, label: t.common.home },
      { href: '/portal/events', icon: Calendar, label: t.common.discover },
      { href: '/portal/registrations', icon: Ticket, label: t.common.myEvents },
      { href: '/portal/profile', icon: User, label: t.common.profile },
    ];

    // Add participants management for caregivers
    if (isCaregiver) {
      return [
        ...baseItems.slice(0, 3),
        { href: '/portal/participants', icon: Users, label: 'Participants' },
        ...baseItems.slice(3)
      ];
    }

    return baseItems;
  }, [t, isCaregiver]);

  // Get role-specific portal name
  const portalName = React.useMemo(() => {
    return {
      volunteer: t.nav.volunteerPortal,
      caregiver: t.nav.caregiverPortal,
      participant: t.nav.participantPortal
    }[role] || 'Portal';
  }, [role, t]);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20 md:pb-0 transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-lg border-b border-zinc-200 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold shadow-sm`}
            style={{
              background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.dark})`
            }}
          >
            {theme.emoji}
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2D1E17]">Careable</h1>
            <p className="text-[10px] text-[#6B5A4E]">{portalName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PreferenceToggles />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 md:px-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-zinc-200 flex items-center justify-around py-2 px-2 md:hidden z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[var(--color-primary-light)]' 
                  : 'text-[#6B5A4E] hover:bg-zinc-50'
              }`}
              style={isActive ? {
                color: theme.primary
              } : undefined}
            >
              <Icon 
                className="w-5 h-5" 
                style={isActive ? { color: theme.primary } : { color: '#6B5A4E' }}
              />
              <span 
                className="text-[10px] font-bold"
                style={isActive ? { color: theme.primary } : { color: '#6B5A4E' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
