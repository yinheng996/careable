import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations, getParticipantEvents } from '@/app/actions/participant';
import AttendanceQR from '@/src/components/AttendanceQR';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCurrentUserRole, getRoleLabels } from '@/lib/role-utils';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const role = await getCurrentUserRole();
  
  // Only allow portal roles, redirect if admin/staff
  if (role === 'admin' || role === 'staff') {
    redirect(`/${role}/dashboard`);
  }
  
  const labels = getRoleLabels(role as 'volunteer' | 'caregiver' | 'participant');
  
  // Fetch data
  const registrationsRes = await getUserRegistrations();
  const registrations = registrationsRes.data || [];
  const eventsRes = await getParticipantEvents();
  const availableEvents = (eventsRes.data || []).slice(0, 3);

  // Get theme colors based on role
  const themeColors = {
    volunteer: {
      primary: '#86B1A4',
      gradient: 'from-white to-[#E8F3F0]',
      iconColor: '#86B1A4'
    },
    caregiver: {
      primary: '#EC4899',
      gradient: 'from-white to-[#FCE7F3]',
      iconColor: '#EC4899'
    },
    participant: {
      primary: '#E89D71',
      gradient: 'from-white to-[#FEF3EB]',
      iconColor: '#E89D71'
    }
  }[role];

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Welcome Banner */}
      <div 
        className={`bg-gradient-to-br ${themeColors.gradient} p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6`}
      >
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D1E17]">
            {labels.welcomeTitle}
          </h2>
          <p className="text-[#6B5A4E] text-base md:text-lg">
            {labels.welcomeSubtitle}
          </p>
        </div>
        <Link href="/portal/events">
          <Button 
            className="text-white rounded-xl h-12 px-8 font-bold shadow-lg transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: themeColors.primary,
              boxShadow: `0 10px 25px -5px ${themeColors.primary}40`
            }}
          >
            {labels.discoverCTA}
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Registered Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" style={{ color: themeColors.iconColor }} />
              {labels.myEventsTitle}
            </h3>
          </div>
          {registrations.length > 0 ? (
            <div className="grid gap-4">
              {registrations.map((reg: any) => (
                <div 
                  key={reg.id} 
                  className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#2D1E17]">{reg.events.title}</h4>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(reg.events.start_time), 'EEE, dd MMM')}
                    </p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {reg.events.location}
                    </p>
                    {role === 'volunteer' && (
                      <p className="text-[10px] mt-1 text-zinc-600">
                        Status: <span className={cn("font-bold uppercase tracking-wider", 
                          reg.status === 'attended' ? 'text-green-600' : 'text-blue-600')}>
                          {reg.status}
                        </span>
                      </p>
                    )}
                  </div>
                  {reg.status !== 'attended' && (
                    <AttendanceQR 
                      registrationId={reg.id} 
                      eventTitle={reg.events.title} 
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-zinc-200 text-center">
              <Heart className="w-10 h-10 text-zinc-100 mx-auto mb-3" />
              <p className="text-zinc-400">
                {role === 'volunteer' ? 'Ready to help out?' : "You haven't joined any events yet."}
              </p>
              <Link href="/portal/events">
                <Button 
                  variant="link" 
                  className="font-bold mt-2"
                  style={{ color: themeColors.primary }}
                >
                  {role === 'volunteer' ? 'Find an opportunity' : 'Find your first event'}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Suggested Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2D1E17] flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: themeColors.iconColor }} />
              {labels.suggestedTitle}
            </h3>
            <Link href="/portal/events" className="text-xs font-bold hover:underline" style={{ color: themeColors.primary }}>
              View All
            </Link>
          </div>
          <div className="grid gap-4">
            {availableEvents.length > 0 ? (
              availableEvents.map((event: any) => (
                <Link key={event.id} href={`/portal/events/${event.id}`}>
                  <div 
                    className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all group"
                    style={{
                      borderColor: 'rgb(244 244 245)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${themeColors.primary}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(244 244 245)';
                    }}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#2D1E17] transition-colors">{event.title}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-1">{event.location}</p>
                    </div>
                    <ChevronRight 
                      className="w-5 h-5 text-zinc-300 transform group-hover:translate-x-1 transition-all" 
                      style={{
                        color: '#d4d4d8'
                      }}
                    />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-10 bg-zinc-50 rounded-2xl">
                No new {role === 'volunteer' ? 'opportunities' : 'events'} at the moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
