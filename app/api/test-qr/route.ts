import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { issueQrForRegistration, verifyQrToken } from '@/lib/qrAttendance';

/**
 * GET /api/test-qr
 * Test QR generation and verification
 */
export async function GET() {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the Supabase JWT token
    const token = await getToken({ template: 'careable_supabase' });
    
    console.log('[Test QR] User ID:', userId);
    console.log('[Test QR] JWT token exists:', !!token);
    console.log('[Test QR] JWT token preview:', token?.substring(0, 50) + '...');

    // Find a registration for this user
    const supabase = await createClient();
    const { data: registration, error: findError } = await supabase
      .from('registrations')
      .select('id, ticket_code, status')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (findError || !registration) {
      return NextResponse.json({
        error: 'No registration found for this user',
        details: findError,
        userId
      }, { status: 404 });
    }

    console.log('[Test QR] Found registration:', registration.id);
    console.log('[Test QR] Current ticket_code:', registration.ticket_code);

    // Try to generate a QR code
    try {
      const qrResult = await issueQrForRegistration(registration.id);
      console.log('[Test QR] QR generated successfully');

      // Immediately try to verify it
      const verifyResult = await verifyQrToken(qrResult.token, userId);
      console.log('[Test QR] Verification result:', verifyResult);

      return NextResponse.json({
        success: true,
        test: 'QR Generation and Verification',
        registration: {
          id: registration.id,
          oldTicketCode: registration.ticket_code
        },
        qrGeneration: {
          success: true,
          tokenLength: qrResult.token.length,
          qrCodeGenerated: qrResult.qrBase64.length > 0
        },
        verification: verifyResult
      });

    } catch (qrError: any) {
      console.error('[Test QR] Error:', qrError);
      return NextResponse.json({
        error: 'QR generation failed',
        details: qrError.message,
        registration: {
          id: registration.id,
          ticket_code: registration.ticket_code
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Test QR] Fatal error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
