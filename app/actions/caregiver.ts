'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { issueQrForRegistration } from '@/lib/qrAttendance';
import type { Relationship } from '@/lib/supabase/model';
import crypto from 'crypto';

/**
 * Link a participant to the current caregiver
 */
export async function linkParticipant(data: {
  participantId: string;
  relationship: Relationship;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: link, error } = await supabase
    .from('caregiver_participants')
    .insert({
      caregiver_id: userId,
      participant_id: data.participantId,
      relationship: data.relationship
    })
    .select()
    .single();

  if (error) {
    console.error('Error linking participant:', error);
    return { error: 'Failed to link participant' };
  }

  return { success: true, data: link };
}

/**
 * Create a new participant profile and link to caregiver
 */
export async function createAndLinkParticipant(data: {
  participantFullName: string;
  relationship: Relationship;
  specialNeeds?: string;
  emergencyContact?: string;
  membershipType?: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Generate a unique ID for the participant
  const participantId = `participant_${crypto.randomBytes(16).toString('hex')}`;

  // Create participant profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: participantId,
      email: `${participantId}@careable.placeholder`, // Placeholder email
      participant_full_name: data.participantFullName,
      role: 'participant',
      special_needs: data.specialNeeds || null,
      emergency_contact: data.emergencyContact || null,
      membership_type: data.membershipType || null,
      is_first_time: false // Managed by caregiver
    })
    .select()
    .single();

  if (profileError) {
    console.error('Error creating participant profile:', profileError);
    return { error: 'Failed to create participant profile' };
  }

  // Link to caregiver
  const { data: link, error: linkError } = await supabase
    .from('caregiver_participants')
    .insert({
      caregiver_id: userId,
      participant_id: participantId,
      relationship: data.relationship
    })
    .select()
    .single();

  if (linkError) {
    console.error('Error linking participant:', linkError);
    // Clean up the profile we just created
    await supabase.from('profiles').delete().eq('id', participantId);
    return { error: 'Failed to link participant' };
  }

  return { success: true, data: { profile, link } };
}

/**
 * Get all participants managed by current caregiver
 */
export async function getManagedParticipants() {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('caregiver_participants')
    .select(`
      id,
      participant_id,
      relationship,
      created_at,
      participant:profiles!caregiver_participants_participant_id_fkey (
        id,
        full_name,
        participant_full_name,
        email,
        special_needs,
        membership_type
      )
    `)
    .eq('caregiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching managed participants:', error);
    return { error: 'Failed to fetch participants' };
  }

  return { success: true, data };
}

/**
 * Register a participant for an event (by caregiver)
 */
export async function registerParticipantForEvent(data: {
  participantId: string;
  eventId: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Verify caregiver manages this participant
  const { data: link } = await supabase
    .from('caregiver_participants')
    .select('id')
    .eq('caregiver_id', userId)
    .eq('participant_id', data.participantId)
    .single();

  if (!link) {
    return { error: 'You do not manage this participant' };
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', data.eventId)
    .eq('user_id', data.participantId)
    .single();

  if (existing) {
    return { error: 'Participant is already registered for this event' };
  }

  // Generate ticket code
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Create registration
  const { data: registration, error } = await supabase
    .from('registrations')
    .insert({
      event_id: data.eventId,
      user_id: data.participantId,
      ticket_code: tokenHash,
      status: 'registered',
      registration_source: 'caregiver'
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering participant:', error);
    return { error: 'Failed to register participant' };
  }

  return { success: true, data: registration };
}

/**
 * Get registrations for a specific participant
 */
export async function getParticipantRegistrations(participantId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Verify caregiver manages this participant
  const { data: link } = await supabase
    .from('caregiver_participants')
    .select('id')
    .eq('caregiver_id', userId)
    .eq('participant_id', participantId)
    .single();

  if (!link) {
    return { error: 'You do not manage this participant' };
  }

  // Fetch registrations
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      check_in_at,
      created_at,
      event:events (
        id,
        title,
        location,
        start_time,
        end_time,
        is_accessible
      )
    `)
    .eq('user_id', participantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching participant registrations:', error);
    return { error: 'Failed to fetch registrations' };
  }

  return { success: true, data };
}

/**
 * Cancel a registration on behalf of a participant
 */
export async function cancelParticipantRegistration(registrationId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Fetch registration to get participant ID
  const { data: registration } = await supabase
    .from('registrations')
    .select('user_id')
    .eq('id', registrationId)
    .single();

  if (!registration) {
    return { error: 'Registration not found' };
  }

  // Verify caregiver manages this participant
  const { data: link } = await supabase
    .from('caregiver_participants')
    .select('id')
    .eq('caregiver_id', userId)
    .eq('participant_id', registration.user_id)
    .single();

  if (!link) {
    return { error: 'You do not manage this participant' };
  }

  // Delete the registration
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);

  if (error) {
    console.error('Error cancelling registration:', error);
    return { error: 'Failed to cancel registration' };
  }

  return { success: true };
}

/**
 * Update participant details
 */
export async function updateParticipant(
  participantId: string,
  data: {
    participantFullName?: string;
    specialNeeds?: string;
    emergencyContact?: string;
    membershipType?: string;
  }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Verify caregiver manages this participant
  const { data: link } = await supabase
    .from('caregiver_participants')
    .select('id')
    .eq('caregiver_id', userId)
    .eq('participant_id', participantId)
    .single();

  if (!link) {
    return { error: 'You do not manage this participant' };
  }

  // Update participant profile
  const updateData: any = {};
  if (data.participantFullName !== undefined) updateData.participant_full_name = data.participantFullName;
  if (data.specialNeeds !== undefined) updateData.special_needs = data.specialNeeds;
  if (data.emergencyContact !== undefined) updateData.emergency_contact = data.emergencyContact;
  if (data.membershipType !== undefined) updateData.membership_type = data.membershipType;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', participantId);

  if (error) {
    console.error('Error updating participant:', error);
    return { error: 'Failed to update participant' };
  }

  return { success: true };
}

/**
 * Remove participant link (does not delete the participant profile)
 */
export async function unlinkParticipant(linkId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('caregiver_participants')
    .delete()
    .eq('id', linkId)
    .eq('caregiver_id', userId); // Ensure only owner can delete

  if (error) {
    console.error('Error unlinking participant:', error);
    return { error: 'Failed to unlink participant' };
  }

  return { success: true };
}
