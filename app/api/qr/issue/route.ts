import { auth } from '@clerk/nextjs/server';
import { issueQrForRegistration } from '@/lib/qrAttendance';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/qr/issue
 * Generates a QR code for a specific registration.
 */
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { registrationId } = await req.json();
    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if user owns the registration or is staff/admin
    const { data: registration, error } = await supabase
      .from('registrations')
      .select('user_id')
      .eq('id', registrationId)
      .single();

    if (error || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const userRole = sessionClaims?.metadata?.role;
    const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';

    // In clerk, userId is a string. In our profiles table, it's stored as UUID (casted Clerk ID).
    // We need to compare correctly.
    if (registration.user_id !== userId && !isStaffOrAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const result = await issueQrForRegistration(registrationId);
    
    return NextResponse.json({
      status: 'ok',
      qrCode: result.qrBase64,
      // We don't return the raw token to the client in a production app 
      // UNLESS the client needs it for something else. 
      // The QR code already contains it.
    });
  } catch (error: any) {
    console.error('QR Issue Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
