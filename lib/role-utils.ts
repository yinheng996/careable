/**
 * Role-based utilities for the unified portal
 * Provides role detection, theming, and navigation configuration
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/supabase/model';
import { createClient } from '@/lib/supabase/server';

/**
 * Role Theme Configuration
 * Maps each user role to its color palette
 */
export const ROLE_THEMES = {
  volunteer: {
    primary: '#86B1A4',      // Green
    dark: '#6FA08F',
    light: '#E8F3F0',
    emoji: '🤝',
    gradient: 'from-[#86B1A4] to-[#6FA08F]'
  },
  caregiver: {
    primary: '#EC4899',      // Pink (rose-500)
    dark: '#DB2777',         // rose-600
    light: '#FCE7F3',        // rose-100
    emoji: '💖',
    gradient: 'from-[#EC4899] to-[#DB2777]'
  },
  participant: {
    primary: '#E89D71',      // Orange
    dark: '#D88C61',
    light: '#FEF3EB',
    emoji: '🧡',
    gradient: 'from-[#E89D71] to-[#D88C61]'
  }
} as const;

/**
 * Get current user's role from Clerk session
 * Redirects to sign-in if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Try to get role from Clerk metadata first
  const clerkRole = sessionClaims?.metadata?.role as UserRole | undefined;
  
  if (clerkRole && ['volunteer', 'caregiver', 'participant'].includes(clerkRole)) {
    return clerkRole;
  }
  
  // Fallback: get from database
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profile?.role && ['volunteer', 'caregiver', 'participant'].includes(profile.role)) {
    return profile.role;
  }
  
  // Default to participant if unable to determine
  return 'participant';
}

/**
 * Get user ID, redirects if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
}

/**
 * Get role theme configuration
 */
export function getRoleTheme(role: 'volunteer' | 'caregiver' | 'participant') {
  return ROLE_THEMES[role];
}

/**
 * Check if user has caregiver role
 */
export async function isCaregiver(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'caregiver';
}

/**
 * Get role-specific navigation items
 */
export function getRoleNavItems(role: 'volunteer' | 'caregiver' | 'participant', t: any) {
  const baseItems = [
    { href: '/portal/dashboard', icon: 'Home', label: t.common.home },
    { href: '/portal/events', icon: 'Calendar', label: t.common.discover },
    { href: '/portal/registrations', icon: 'Ticket', label: t.common.myEvents },
    { href: '/portal/profile', icon: 'User', label: t.common.profile },
  ];
  
  // Add caregiver-specific nav item
  if (role === 'caregiver') {
    return [
      ...baseItems.slice(0, 3),
      { href: '/portal/participants', icon: 'Users', label: t.common.participants || 'Participants' },
      ...baseItems.slice(3)
    ];
  }
  
  return baseItems;
}

/**
 * Get role-specific labels and text
 */
export function getRoleLabels(role: 'volunteer' | 'caregiver' | 'participant') {
  return {
    volunteer: {
      portalName: 'Volunteer Portal',
      eventsTitle: 'Volunteer Opportunities',
      welcomeTitle: 'Volunteer with Purpose!',
      welcomeSubtitle: 'Your support makes our community stronger every day.',
      discoverCTA: 'View Opportunities',
      myEventsTitle: 'My Registered Events',
      suggestedTitle: 'Latest Needs'
    },
    caregiver: {
      portalName: 'Caregiver Portal',
      eventsTitle: 'Events for Participants',
      welcomeTitle: 'Welcome, Caregiver!',
      welcomeSubtitle: 'Help your participants discover meaningful activities.',
      discoverCTA: 'Browse Events',
      myEventsTitle: 'Registered Events',
      suggestedTitle: 'Recommended Events'
    },
    participant: {
      portalName: 'Participant Portal',
      eventsTitle: 'Events for You',
      welcomeTitle: 'Welcome to Careable!',
      welcomeSubtitle: 'Your journey to wellness and community starts here.',
      discoverCTA: 'Browse All Events',
      myEventsTitle: 'My Upcoming Events',
      suggestedTitle: 'New Opportunities'
    }
  }[role];
}

/**
 * Filter events based on user role
 */
export function getEventFilterForRole(role: 'volunteer' | 'caregiver' | 'participant') {
  if (role === 'volunteer') {
    return ['volunteers', 'both'];
  }
  // Both caregiver and participant see participant-targeted events
  return ['participants', 'both'];
}
