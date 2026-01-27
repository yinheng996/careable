'use client';

import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@/lib/supabase/model';

/**
 * Role Theme Configuration (Client-side copy)
 */
export const ROLE_THEMES = {
  volunteer: {
    primary: '#86B1A4',
    dark: '#6FA08F',
    light: '#E8F3F0',
    emoji: '🤝',
    gradient: 'from-[#86B1A4] to-[#6FA08F]'
  },
  caregiver: {
    primary: '#EC4899',
    dark: '#DB2777',
    light: '#FCE7F3',
    emoji: '💖',
    gradient: 'from-[#EC4899] to-[#DB2777]'
  },
  participant: {
    primary: '#E89D71',
    dark: '#D88C61',
    light: '#FEF3EB',
    emoji: '🧡',
    gradient: 'from-[#E89D71] to-[#D88C61]'
  }
} as const;

/**
 * Client-side hook for accessing user role and theme information
 * Uses Clerk's useUser hook to get role from publicMetadata
 */
export function useUserRole() {
  const { user, isLoaded } = useUser();
  
  // Get role from Clerk metadata, default to 'participant'
  const role = (user?.publicMetadata?.role as UserRole) || 'participant';
  
  // Only allow portal roles
  const portalRole = ['volunteer', 'caregiver', 'participant'].includes(role)
    ? (role as 'volunteer' | 'caregiver' | 'participant')
    : 'participant';
  
  return {
    role: portalRole,
    isVolunteer: portalRole === 'volunteer',
    isCaregiver: portalRole === 'caregiver',
    isParticipant: portalRole === 'participant',
    theme: ROLE_THEMES[portalRole],
    isLoaded
  };
}
