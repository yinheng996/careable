import { 
  getAttendanceMetrics, 
  getTopStaff, 
  getTopParticipants, 
  getTopVolunteers, 
  getEventHotspots,
  getPlatformStats,
  getCaregiverStats
} from '@/lib/analytics/queries';
import { Card } from '@/components/ui/card';
import { Users, Calendar, CheckCircle, TrendingUp, UserCheck, Heart } from 'lucide-react';

export default async function AdminDashboard() {
  const [
    metricsRes, 
    staffRes, 
    participantsRes, 
    volunteersRes, 
    hotspotsRes,
    platformRes,
    caregiverRes
  ] = await Promise.all([
    getAttendanceMetrics(),
    getTopStaff(10),
    getTopParticipants(10),
    getTopVolunteers(10),
    getEventHotspots(),
    getPlatformStats(),
    getCaregiverStats()
  ]);

  const metrics = metricsRes.success ? metricsRes.data : null;
  const topStaff = staffRes.success ? staffRes.data : [];
  const topParticipants = participantsRes.success ? participantsRes.data : [];
  const topVolunteers = volunteersRes.success ? volunteersRes.data : [];
  const hotspots = hotspotsRes.success ? hotspotsRes.data : [];
  const platformStats = platformRes.success ? platformRes.data : null;
  const caregiverStats = caregiverRes.success ? caregiverRes.data : null;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D1E17]">Analytics Dashboard</h1>
        <p className="text-[#6B5A4E] mt-2">Comprehensive overview of platform performance and user engagement</p>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Total Users</div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">{platformStats?.totalUsers || 0}</div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                {platformStats?.userCounts.participant || 0} participants • {platformStats?.userCounts.volunteer || 0} volunteers
              </div>
            </div>
            <div className="w-12 h-12 bg-[#FEF3EB] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#E89D71]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Total Events</div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">{platformStats?.totalEvents || 0}</div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                {platformStats?.activeEvents || 0} active
              </div>
            </div>
            <div className="w-12 h-12 bg-[#E8F3F0] rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#86B1A4]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Total Check-ins</div>
              <div className="text-4xl font-bold text-[#2D1E17] mt-2">{platformStats?.totalCheckIns || 0}</div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                of {platformStats?.totalRegistrations || 0} registrations
              </div>
            </div>
            <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B5A4E] uppercase tracking-wide">Attendance Rate</div>
              <div className="text-4xl font-bold text-[#E89D71] mt-2">{platformStats?.overallAttendanceRate || 0}%</div>
              <div className="text-xs text-[#6B5A4E] mt-1">
                Overall platform average
              </div>
            </div>
            <div className="w-12 h-12 bg-[#FEF3EB] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#E89D71]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Caregiver Stats */}
      {caregiverStats && (
        <Card className="p-6 bg-gradient-to-br from-[#FEF3EB] to-white border border-[#E89D71]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#E89D71] rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2D1E17]">Caregiver Program</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-[#6B5A4E]">Active Caregivers</div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">{caregiverStats.totalCaregivers}</div>
            </div>
            <div>
              <div className="text-sm text-[#6B5A4E]">Managed Participants</div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">{caregiverStats.totalRelationships}</div>
            </div>
            <div>
              <div className="text-sm text-[#6B5A4E]">Caregiver Registrations</div>
              <div className="text-3xl font-bold text-[#E89D71] mt-1">{caregiverStats.caregiverRegistrations}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Staff Leaderboard */}
      <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6B5A4E] rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#2D1E17]">Top Staff Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Events Created</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Check-ins Performed</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B5A4E]">Active Events</th>
              </tr>
            </thead>
            <tbody>
              {topStaff.map((staff, idx) => (
                <tr key={staff.staff_id} className="border-b border-zinc-50 hover:bg-[#FEF3EB] transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 rounded-full bg-[#E89D71] text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#2D1E17] font-medium">{staff.staff_name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-right text-[#2D1E17] font-semibold">{staff.events_created}</td>
                  <td className="py-3 px-4 text-right text-[#86B1A4] font-semibold">{staff.check_ins_performed}</td>
                  <td className="py-3 px-4 text-right text-[#E89D71] font-semibold">{staff.active_events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Participant & Volunteer Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Participants */}
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Top Participants</h2>
          <div className="space-y-2">
            {topParticipants.slice(0, 10).map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#FEF3EB] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E89D71] text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1E17]">{user.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-[#6B5A4E]">{user.total_attended} attended • {user.total_registrations} registered</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#E89D71]">{user.attendance_rate_percent.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Volunteers */}
        <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Top Volunteers</h2>
          <div className="space-y-2">
            {topVolunteers.slice(0, 10).map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#E8F3F0] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#86B1A4] text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#2D1E17]">{user.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-[#6B5A4E]">{user.total_attended} attended • {user.total_registrations} registered</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#86B1A4]">{user.attendance_rate_percent.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Event Hotspots */}
      <Card className="p-6 bg-white border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-bold text-[#2D1E17] mb-4">Popular Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots.slice(0, 9).map((spot, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-zinc-100 hover:border-[#E89D71] transition-colors bg-gradient-to-br from-white to-[#FEF3EB]/30">
              <div className="text-sm text-[#6B5A4E] line-clamp-2 min-h-[40px]">{spot.location}</div>
              <div className="text-2xl font-bold text-[#E89D71] mt-2">{spot.eventCount} events</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
