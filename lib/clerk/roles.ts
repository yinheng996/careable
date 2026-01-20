import { auth, clerkClient } from '@clerk/nextjs/server'
import type { UserRole } from '@/lib/supabase/model'

/**
 * Checks if the current user has a specific role.
 */
export async function checkRole(role: UserRole) {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

/**
 * Updates a user's role in Clerk publicMetadata.
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const client = await clerkClient()
  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Clerk role update error:', error)
    return { error: 'Failed to update user role' }
  }
}

/**
 * Checks if the user is a caregiver (based on session claims or metadata).
 * This assumes you might store 'isCaregiver' in metadata as well.
 */
export async function isCaregiver() {
  const { sessionClaims } = await auth()
  // This logic depends on how you store caregiver status in Clerk.
  // If it's only in Supabase, you should use the supabase/db service instead.
  return !!sessionClaims?.metadata.role // Placeholder logic
}
