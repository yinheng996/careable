import crypto from 'crypto';
import QRCode from 'qrcode';
import { createClient } from './supabase/server';

/**
 * QR Attendance Service Module
 * Handles generation and verification of attendance QR codes.
 */

interface IssueQrResult {
  token: string;
  qrBase64: string;
}

/**
 * Generates a secure token, stores its hash as ticket_code, and returns the QR code.
 */
export async function issueQrForRegistration(registrationId: string): Promise<IssueQrResult> {
  const supabase = await createClient();

  // 1. Generate a cryptographically random token
  const token = crypto.randomBytes(32).toString('base64url');

  // 2. Compute SHA-256 hash of the token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // 3. Update the registration record with the token hash
  // We use ticket_code field to store the hash securely
  const { error } = await supabase
    .from('registrations')
    .update({ ticket_code: tokenHash })
    .eq('id', registrationId);

  if (error) {
    console.error('Error updating registration with token hash:', error);
    throw new Error('Failed to issue QR code');
  }

  // 4. Generate QR code image (Base64 Data URI)
  const qrBase64 = await QRCode.toDataURL(token, {
    margin: 1,
    width: 400
  });

  return {
    token,
    qrBase64
  };
}

interface VerifyResult {
  status: 'ok' | 'invalid' | 'already_checked_in';
  registrationId?: string;
  attendeeName?: string;
  role?: string;
}

/**
 * Verifies a token by hashing it and looking up the registration.
 * Marks attendance if valid and not already checked in.
 * @param token - The QR code token to verify
 * @param staffUserId - The ID of the staff member performing the check-in
 * @param notes - Optional attendance notes
 */
export async function verifyQrToken(
  token: string, 
  staffUserId?: string,
  notes?: string
): Promise<VerifyResult> {
  const supabase = await createClient();

  // 1. Basic sanity check
  if (!token || typeof token !== 'string') {
    return { status: 'invalid' };
  }

  // 2. Hash the incoming token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // 3. Lookup registration by ticket_code (which stores the hash)
  const { data: registration, error } = await supabase
    .from('registrations')
    .select(`
      id,
      check_in_at,
      status,
      profiles (
        full_name,
        role
      )
    `)
    .eq('ticket_code', tokenHash)
    .single();

  if (error || !registration) {
    console.log('Verification failed: Token not found or error', error);
    return { status: 'invalid' };
  }

  // 4. Check if already checked in
  if (registration.check_in_at) {
    return { status: 'already_checked_in' };
  }

  // 5. Mark attendance (with staff tracking)
  const updateData: any = {
    status: 'attended' as const,
    check_in_at: new Date().toISOString()
  };

  // Add staff tracking if staffUserId provided
  if (staffUserId) {
    updateData.checked_in_by = staffUserId;
  }

  // Add notes if provided
  if (notes) {
    updateData.attendance_notes = notes;
  }

  const { error: updateError } = await supabase
    .from('registrations')
    .update(updateData)
    .eq('id', registration.id);

  if (updateError) {
    console.error('Error marking attendance:', updateError);
    throw new Error('Failed to update attendance status');
  }

  const profile = Array.isArray(registration.profiles) 
    ? registration.profiles[0] 
    : registration.profiles;

  return {
    status: 'ok',
    registrationId: registration.id,
    attendeeName: profile?.full_name || 'Attendee',
    role: profile?.role
  };
}
