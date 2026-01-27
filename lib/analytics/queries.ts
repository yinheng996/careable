'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { EventAttendanceSummary, UserEngagementSummary, StaffProductivitySummary } from '@/lib/supabase/model';

/**
 * Check if user is staff or admin
 */
async function requireStaffOrAdmin() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const role = sessionClaims?.metadata?.role;
  if (role !== 'staff' && role !== 'admin') {
    throw new Error('Forbidden: Staff or Admin access required');
  }

  return { userId, role };
}

/**
 * Get attendance metrics for date range
 */
export async function getAttendanceMetrics(dateRange?: {
  start: string;
  end: string;
}) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  let query = supabase
    .from('event_attendance_summary')
    .select('*');

  if (dateRange) {
    query = query
      .gte('start_time', dateRange.start)
      .lte('start_time', dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance metrics:', error);
    return { error: 'Failed to fetch metrics' };
  }

  // Calculate aggregate metrics
  const events = data as EventAttendanceSummary[];
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.total_registrations, 0);
  const totalAttended = events.reduce((sum, e) => sum + e.total_attended, 0);
  const avgAttendanceRate = totalRegistrations > 0 
    ? (totalAttended / totalRegistrations) * 100 
    : 0;

  return {
    success: true,
    data: {
      events,
      summary: {
        totalEvents,
        totalRegistrations,
        totalAttended,
        avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100
      }
    }
  };
}

/**
 * Get top staff members by events created and check-ins performed
 */
export async function getTopStaff(limit: number = 10) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff_productivity_summary')
    .select('*')
    .order('events_created', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top staff:', error);
    return { error: 'Failed to fetch staff metrics' };
  }

  return { success: true, data: data as StaffProductivitySummary[] };
}

/**
 * Get top participants by attendance
 */
export async function getTopParticipants(limit: number = 20) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_engagement_summary')
    .select('*')
    .eq('role', 'participant')
    .order('total_attended', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top participants:', error);
    return { error: 'Failed to fetch participant metrics' };
  }

  return { success: true, data: data as UserEngagementSummary[] };
}

/**
 * Get top volunteers by attendance
 */
export async function getTopVolunteers(limit: number = 20) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_engagement_summary')
    .select('*')
    .eq('role', 'volunteer')
    .order('total_attended', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top volunteers:', error);
    return { error: 'Failed to fetch volunteer metrics' };
  }

  return { success: true, data: data as UserEngagementSummary[] };
}

/**
 * Get event location hotspots
 */
export async function getEventHotspots() {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('location, status')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching event hotspots:', error);
    return { error: 'Failed to fetch location data' };
  }

  // Group by location
  const locationMap = new Map<string, number>();
  data.forEach((event: any) => {
    const count = locationMap.get(event.location) || 0;
    locationMap.set(event.location, count + 1);
  });

  const hotspots = Array.from(locationMap.entries())
    .map(([location, count]) => ({ location, eventCount: count }))
    .sort((a, b) => b.eventCount - a.eventCount);

  return { success: true, data: hotspots };
}

/**
 * Get event statistics by month
 */
export async function getEventsByMonth(year: number = new Date().getFullYear()) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;

  const { data, error } = await supabase
    .from('events')
    .select('start_time, status')
    .gte('start_time', startDate)
    .lte('start_time', endDate);

  if (error) {
    console.error('Error fetching events by month:', error);
    return { error: 'Failed to fetch event data' };
  }

  // Group by month
  const monthCounts = Array(12).fill(0);
  data.forEach((event: any) => {
    const month = new Date(event.start_time).getMonth();
    monthCounts[month]++;
  });

  const monthlyData = monthCounts.map((count, index) => ({
    month: new Date(year, index).toLocaleString('default', { month: 'short' }),
    eventCount: count
  }));

  return { success: true, data: monthlyData };
}

/**
 * Get recent check-ins (last 50)
 */
export async function getRecentCheckIns(limit: number = 50) {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      check_in_at,
      attendance_notes,
      user:profiles!registrations_user_id_fkey (
        full_name,
        participant_full_name,
        role
      ),
      event:events (
        title,
        start_time
      ),
      staff:profiles!registrations_checked_in_by_fkey (
        full_name
      )
    `)
    .not('check_in_at', 'is', null)
    .order('check_in_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent check-ins:', error);
    return { error: 'Failed to fetch check-in data' };
  }

  return { success: true, data };
}

/**
 * Get caregiver engagement statistics
 */
export async function getCaregiverStats() {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  // Count caregivers with managed participants
  const { count: totalCaregivers } = await supabase
    .from('caregiver_participants')
    .select('caregiver_id', { count: 'exact', head: true });

  // Count total caregiver-participant relationships
  const { count: totalRelationships } = await supabase
    .from('caregiver_participants')
    .select('*', { count: 'exact', head: true });

  // Get registrations made by caregivers
  const { count: caregiverRegistrations } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('registration_source', 'caregiver');

  return {
    success: true,
    data: {
      totalCaregivers: totalCaregivers || 0,
      totalRelationships: totalRelationships || 0,
      caregiverRegistrations: caregiverRegistrations || 0
    }
  };
}

/**
 * Get overall platform statistics
 */
export async function getPlatformStats() {
  await requireStaffOrAdmin();
  const supabase = await createClient();

  // Count users by role
  const { data: roleData } = await supabase
    .from('profiles')
    .select('role');

  const roleCounts = {
    admin: 0,
    staff: 0,
    volunteer: 0,
    caregiver: 0,
    participant: 0
  };

  roleData?.forEach((user: any) => {
    if (user.role in roleCounts) {
      roleCounts[user.role as keyof typeof roleCounts]++;
    }
  });

  // Count total events
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  // Count active events
  const { count: activeEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Count total registrations
  const { count: totalRegistrations } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true });

  // Count total check-ins
  const { count: totalCheckIns } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .not('check_in_at', 'is', null);

  return {
    success: true,
    data: {
      userCounts: roleCounts,
      totalUsers: Object.values(roleCounts).reduce((sum, count) => sum + count, 0),
      totalEvents: totalEvents || 0,
      activeEvents: activeEvents || 0,
      totalRegistrations: totalRegistrations || 0,
      totalCheckIns: totalCheckIns || 0,
      overallAttendanceRate: totalRegistrations 
        ? Math.round(((totalCheckIns || 0) / totalRegistrations) * 100 * 100) / 100
        : 0
    }
  };
}
