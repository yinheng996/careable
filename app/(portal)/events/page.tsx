'use client';

import * as React from 'react';
import { getParticipantEvents } from '@/app/actions/participant';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Search, 
  ChevronRight,
  Loader2,
  Accessibility,
  Users,
  Heart,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';

export default function EventsPage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { role, theme, isVolunteer } = useUserRole();

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const result = await getParticipantEvents();
      if (result.success) {
        setEvents(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventBadge = (startTime: string) => {
    const date = new Date(startTime);
    if (isToday(date)) return { text: 'Today', color: 'bg-red-100 text-red-700' };
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'bg-blue-100 text-blue-700' };
    if (isThisWeek(date)) return { text: 'This Week', color: 'bg-green-100 text-green-700' };
    return null;
  };

  // Role-specific content
  const content = {
    volunteer: {
      icon: Heart,
      badge: 'Make a Difference',
      title: (
        <>
          Volunteer<br/>Opportunities
        </>
      ),
      subtitle: 'Join our events, support our community, and create meaningful impact',
      loadingText: 'Finding volunteer opportunities...',
      searchPlaceholder: 'Search opportunities or locations...',
      countLabel: 'Opportunities',
      capacityLabel: 'needed',
      emptyTitle: 'No opportunities found',
      emptyMessage: 'Try adjusting your search terms or browse all available opportunities.',
      emptyNoSearch: 'Check back soon for new ways to help!'
    },
    caregiver: {
      icon: Heart,
      badge: 'Events for Participants',
      title: (
        <>
          Browse Events for<br/>Your Participants
        </>
      ),
      subtitle: 'Find meaningful activities for your participants to join',
      loadingText: 'Loading events...',
      searchPlaceholder: 'Search events or locations...',
      countLabel: 'Events',
      capacityLabel: 'seats',
      emptyTitle: 'No events found',
      emptyMessage: 'Try adjusting your search terms or browse all available events.',
      emptyNoSearch: 'Check back soon for new exciting activities!'
    },
    participant: {
      icon: Sparkles,
      badge: 'Discover Events',
      title: (
        <>
          Find Your Next<br/>Adventure
        </>
      ),
      subtitle: 'Join engaging activities and connect with our community',
      loadingText: 'Discovering amazing events for you...',
      searchPlaceholder: 'Search events or locations...',
      countLabel: 'Events',
      capacityLabel: 'seats',
      emptyTitle: 'No events found',
      emptyMessage: 'Try adjusting your search terms or browse all available events.',
      emptyNoSearch: 'Check back soon for new exciting activities!'
    }
  }[role];

  const IconComponent = content.icon;

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
        <p className="text-[#6B5A4E] font-medium text-center">{content.loadingText}</p>
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
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2" style={{ color: theme.primary }}>
            <IconComponent className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">{content.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D1E17] leading-tight">
            {content.title}
          </h1>
          <p className="text-[#6B5A4E] text-sm md:text-base max-w-xl">
            {content.subtitle}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B5A4E]/50" />
            <Input 
              placeholder={content.searchPlaceholder}
              className="pl-12 h-14 bg-white rounded-2xl border-2 border-zinc-100 shadow-sm text-base focus:ring-2 transition-all"
              style={{
                borderColor: '#f4f4f5'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#f4f4f5';
                e.currentTarget.style.boxShadow = '';
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2 text-sm">
            <div className="flex items-center gap-2 text-[#6B5A4E]">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-semibold">{events.length} {content.countLabel}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: theme.primary }}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
            {filteredEvents.map((event) => {
              const badge = getEventBadge(event.start_time);
              
              return (
                <Link key={event.id} href={`/portal/events/${event.id}`}>
                  <div 
                    className="group h-full bg-white backdrop-blur-sm rounded-3xl border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                    style={{
                      borderColor: '#f4f4f5'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.primary;
                      e.currentTarget.style.boxShadow = `0 25px 50px -12px ${theme.primary}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f4f4f5';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Card Header with Badge */}
                    <div className="p-5 pb-4 space-y-3">
                      {badge && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-[#2D1E17] leading-tight line-clamp-2 min-h-[3.5rem]">
                        {event.title}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="px-5 pb-5 space-y-3 flex-1 flex flex-col">
                      {/* Date & Time */}
                      <div className="space-y-2 text-sm text-[#6B5A4E]">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
                          <span className="font-medium">{format(new Date(event.start_time), 'EEE, dd MMM yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
                          <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm text-[#6B5A4E]">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.primary }} />
                        <span className="line-clamp-2 leading-relaxed">{event.location}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.capacity && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 rounded-lg text-xs text-[#6B5A4E]">
                            <Users className="w-3 h-3" />
                            <span>{event.capacity} {content.capacityLabel}</span>
                          </div>
                        )}
                        {event.is_accessible && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg text-xs text-green-700">
                            <Accessibility className="w-3 h-3" />
                            <span>Accessible</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div 
                        className="pt-4 mt-auto border-t border-zinc-100 flex items-center justify-between font-bold text-sm"
                        style={{ color: theme.primary }}
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gradient-to-br from-zinc-100 to-zinc-50 p-8 rounded-full mb-6">
              <Search className="h-12 w-12 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-[#2D1E17] mb-2">{content.emptyTitle}</h3>
            <p className="text-[#6B5A4E] max-w-sm">
              {searchQuery ? content.emptyMessage : content.emptyNoSearch}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-3 text-white rounded-xl font-semibold transition-colors shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 10px 25px -5px ${theme.primary}40`
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
