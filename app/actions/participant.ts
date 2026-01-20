'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getParticipantEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getParticipantEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function registerForEvent(eventId: string, fullName?: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createClient()

  // 1. If fullName is provided, it means we are updating the profile (first time)
  if (fullName) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName,
        is_first_time: false 
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false, error: 'Failed to update your profile name.' }
    }
  }

  // 2. Generate a unique ticket code (for QR scanning later)
  const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`

  // 3. Create the registration
  const { error: regError } = await supabase
    .from('registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_code: ticketCode,
      status: 'registered'
    })

  if (regError) {
    if (regError.code === '23505') { // Unique constraint violation
      return { success: false, error: 'You are already registered for this event.' }
    }
    console.error('Error creating registration:', regError)
    return { success: false, error: regError.message }
  }

  revalidatePath('/participant/dashboard')
  revalidatePath('/volunteer/dashboard')
  revalidatePath(`/participant/events/${eventId}`)
  
  return { success: true }
}

export async function getUserProfile() {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function checkRegistration(eventId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false, isRegistered: false }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { success: true, isRegistered: false }
  }

  return { success: true, isRegistered: true }
}
