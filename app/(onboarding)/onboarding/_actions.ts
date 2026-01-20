'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { updateUserRole } from '@/lib/clerk/roles'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/supabase/model'

export async function completeOnboarding(formData: {
  role: UserRole;
  membershipType?: string;
  email?: string; // For staff prototype
}) {
  const { userId } = await auth()
  const client = await clerkClient()

  if (!userId) {
    return { error: 'No user ID found' }
  }

  try {
    const user = await client.users.getUser(userId)
    const userEmail = user.emailAddresses[0]?.emailAddress
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()

    if (!userEmail) {
      return { error: 'User email not found' }
    }

    // 1. Update Clerk publicMetadata using service helper
    const clerkResult = await updateUserRole(userId, formData.role)
    if (clerkResult.error) {
      return { error: clerkResult.error }
    }

    // 2. Sync with Supabase profiles table using server service
    const supabase = await createClient()
    const { error: supabaseError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: fullName || null,
        role: formData.role,
        membership_type: formData.membershipType || null,
        updated_at: new Date().toISOString(),
      })

    if (supabaseError) {
      console.error('Supabase sync error:', supabaseError)
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Onboarding error:', error)
    return { error: 'Failed to complete onboarding' }
  }
}
