import { auth } from '@clerk/nextjs/server';
import { verifyQrToken } from '@/lib/qrAttendance';
import { NextResponse } from 'next/server';

/**
 * POST /api/qr/verify
 * Verifies a QR token and marks attendance.
 * Restricted to staff and admins.
 * 
 * Request body:
 * - token: string (required) - The QR code token
 * - notes: string (optional) - Attendance notes
 */
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (userRole !== 'staff' && userRole !== 'admin') {
      return new NextResponse('Forbidden: Only staff can verify attendance', { status: 403 });
    }

    const { token, notes } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Pass staff userId and optional notes to track who performed the check-in
    const result = await verifyQrToken(token, userId, notes);

    if (result.status === 'ok') {
      return NextResponse.json({
        status: 'ok',
        verified: true,
        attendeeName: result.attendeeName,
        role: result.role,
        registrationId: result.registrationId
      });
    }

    if (result.status === 'already_checked_in') {
      return NextResponse.json({
        status: 'error',
        verified: false,
        reason: 'already_checked_in',
        error: 'This attendee has already checked in.'
      }, { status: 409 });
    }

    return NextResponse.json({
      status: 'error',
      verified: false,
      reason: 'invalid_token',
      error: 'Invalid QR code.'
    }, { status: 401 });

  } catch (error: any) {
    console.error('QR Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
