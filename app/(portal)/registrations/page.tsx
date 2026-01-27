'use client';

import * as React from 'react';
import { getUserRegistrations } from '@/app/actions/participant';
import { useAuth } from '@clerk/nextjs';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  Ticket,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import AttendanceQR from '@/src/components/AttendanceQR';
import { useUserRole } from '@/hooks/useUserRole';

export default function RegistrationsPage() {
  const { userId } = useAuth();
  const { role, theme } = useUserRole();
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'upcoming' | 'past'>('upcoming');

  React.useEffect(() => {
    if (userId) {
      fetchRegistrations();
    }
  }, [userId]);

  const fetchRegistrations = async () => {
    try {
      const result = await getUserRegistrations();
      if (result.success) {
        setRegistrations(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const eventDate = new Date(reg.events.start_time);
    if (filter === 'upcoming') return isFuture(eventDate);
    if (filter === 'past') return isPast(eventDate);
    return true;
  });

  const upcomingCount = registrations.filter(r => isFuture(new Date(r.events.start_time))).length;
  const pastCount = registrations.filter(r => isPast(new Date(r.events.start_time))).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div 
            className="w-16 h-16 rounded-full animate-pulse"
            style={{
              background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.dark})`
            }}
          ></div>
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-[#6B5A4E] font-medium text-center">Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="px-4 pt-6 pb-8 border-b"
        style={{
          background: `linear-gradient(to bottom right, white, ${theme.light}, ${theme.light})`,
          borderColor: `${theme.primary}1A`
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2" style={{ color: theme.primary }}>
            <Ticket className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Events</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D1E17] leading-tight">
            Your Registrations
          </h1>
          <p className="text-[#6B5A4E] text-sm md:text-base max-w-xl">
            View your upcoming events and access QR codes for check-in
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setFilter('upcoming')}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={filter === 'upcoming' ? {
                backgroundColor: theme.primary,
                color: 'white',
                boxShadow: `0 10px 25px -5px ${theme.primary}50`
              } : {
                backgroundColor: 'white',
                color: '#6B5A4E'
              }}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={filter === 'past' ? {
                backgroundColor: theme.primary,
                color: 'white',
                boxShadow: `0 10px 25px -5px ${theme.primary}50`
              } : {
                backgroundColor: 'white',
                color: '#6B5A4E'
              }}
            >
              Past ({pastCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={filter === 'all' ? {
                backgroundColor: theme.primary,
                color: 'white',
                boxShadow: `0 10px 25px -5px ${theme.primary}50`
              } : {
                backgroundColor: 'white',
                color: '#6B5A4E'
              }}
            >
              All ({registrations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {filteredRegistrations.length > 0 ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {filteredRegistrations.map((reg) => {
              const isPastEvent = isPast(new Date(reg.events.start_time));
              const isAttended = reg.status === 'attended';

              return (
                <div 
                  key={reg.id} 
                  className={`bg-white rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    isPastEvent ? 'opacity-75' : ''
                  }`}
                  style={{
                    borderColor: isPastEvent ? '#f4f4f5' : '#f4f4f5'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPastEvent) {
                      e.currentTarget.style.borderColor = theme.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f4f4f5';
                  }}
                >
                  <div className="p-5 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isAttended
                          ? 'bg-green-100 text-green-700'
                          : isPastEvent
                          ? 'bg-zinc-100 text-zinc-500'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isAttended ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Attended
                          </>
                        ) : isPastEvent ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Missed
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Registered
                          </>
                        )}
                      </span>

                      {reg.check_in_at && (
                        <span className="text-xs text-green-600 font-medium">
                          Checked in {format(new Date(reg.check_in_at), 'dd MMM, HH:mm')}
                        </span>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-[#2D1E17] leading-tight">
                        {reg.events.title}
                      </h3>

                      <div className="grid gap-2 text-sm text-[#6B5A4E]">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
                          <span className="font-medium">
                            {format(new Date(reg.events.start_time), 'EEEE, dd MMMM yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
                          <span>
                            {format(new Date(reg.events.start_time), 'HH:mm')} - {format(new Date(reg.events.end_time), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.primary }} />
                          <span className="leading-relaxed">{reg.events.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isPastEvent && !isAttended && (
                      <div className="pt-4 border-t border-zinc-100">
                        <AttendanceQR 
                          registrationId={reg.id} 
                          eventTitle={reg.events.title} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <div 
              className="p-12 rounded-3xl mb-6"
              style={{
                background: `linear-gradient(to bottom right, ${theme.light}, ${theme.light}80)`
              }}
            >
              <Ticket className="h-16 w-16 mx-auto" style={{ color: `${theme.primary}66` }} />
            </div>
            <h3 className="text-2xl font-bold text-[#2D1E17] mb-3">
              {filter === 'upcoming' && 'No upcoming events'}
              {filter === 'past' && 'No past events'}
              {filter === 'all' && 'No registrations yet'}
            </h3>
            <p className="text-[#6B5A4E] max-w-sm mb-8">
              {filter === 'upcoming' && "You haven't registered for any upcoming events. Browse our event catalog to find something exciting!"}
              {filter === 'past' && "You don't have any past events in your history yet."}
              {filter === 'all' && "Start your wellness journey by discovering and joining events that interest you."}
            </p>
            <a 
              href="/portal/events"
              className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold transition-colors shadow-lg"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 10px 25px -5px ${theme.primary}50`
              }}
            >
              <Sparkles className="w-5 h-5" />
              Discover Events
            </a>
          </div>
        )}

        {/* Info Card */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-100 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 p-3 rounded-xl text-white shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900">Need help?</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Show your QR code to staff when you arrive at the event. Each QR code can only be used once for check-in.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
