'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getParticipantEventById, 
  registerForEvent, 
  getUserProfile,
  checkRegistration 
} from '@/app/actions/participant';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Users, 
  Accessibility,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useUserRole } from '@/hooks/useUserRole';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { role, theme, isVolunteer } = useUserRole();
  const [event, setEvent] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Registration Flow State
  const [showNamePrompt, setShowNamePrompt] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, profileRes, regRes] = await Promise.all([
        getParticipantEventById(id as string),
        getUserProfile(),
        checkRegistration(id as string)
      ]);

      if (eventRes.success) {
        setEvent(eventRes.data);
      } else {
        setError(eventRes.error || 'Failed to fetch event');
      }

      if (profileRes.success) {
        setProfile(profileRes.data);
        setFullName(profileRes.data.full_name || '');
      }

      if (regRes.success) {
        setIsRegistered(regRes.isRegistered || false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (profile?.is_first_time) {
      setShowNamePrompt(true);
    } else {
      handleConfirmRegistration();
    }
  };

  const handleConfirmRegistration = async () => {
    setIsRegistering(true);
    try {
      const result = await registerForEvent(id as string, showNamePrompt ? fullName : undefined);
      if (result.success) {
        setIsRegistered(true);
        setShowNamePrompt(false);
        const updatedProfile = await getUserProfile();
        if (updatedProfile.success) setProfile(updatedProfile.data);
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Role-specific content
  const content = {
    volunteer: {
      pageTitle: 'Volunteer Opportunity Details',
      registerButtonText: 'Sign Up for Opportunity',
      capacityLabel: 'Volunteers Needed'
    },
    caregiver: {
      pageTitle: 'Event Details',
      registerButtonText: 'Register Participant',
      capacityLabel: 'Spots Available'
    },
    participant: {
      pageTitle: 'Event Details',
      registerButtonText: 'Sign Up for Event',
      capacityLabel: 'Spots Available'
    }
  }[role];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: theme.primary }} />
        <p className="text-zinc-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-900">Oops! Something went wrong</h2>
          <p className="text-red-700">{error || "We couldn't find the event you're looking for."}</p>
          <Button 
            onClick={() => router.push('/portal/events')}
            variant="outline" 
            className="rounded-xl border-red-200 text-red-700 hover:bg-red-100"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ArrowLeft className="w-5 h-5 text-[#6B5A4E]" />
          </Button>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#2D1E17] leading-tight">{event.title}</h1>
          <p className="text-[#6B5A4E]">{content.pageTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-6">
              <CardTitle className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: theme.primary }} />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 px-6">
              <p className="text-[#4A3728] leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-zinc-100 shadow-sm p-6 bg-white flex items-center gap-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${theme.light}` }}
              >
                <Users className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{content.capacityLabel}</p>
                <p className="text-xl font-bold text-[#2D1E17]">{event.capacity || 20} Spots</p>
              </div>
            </Card>
            <Card className="rounded-2xl border-zinc-100 shadow-sm p-6 bg-white flex items-center gap-4">
              <div className="bg-[#E8F3F0] p-3 rounded-xl text-[#86B1A4]">
                <Accessibility className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Accessibility</p>
                <p className="text-xl font-bold text-[#2D1E17]">
                  {event.is_accessible ? "Fully Accessible" : "Standard Entry"}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-zinc-100 shadow-sm p-6 bg-white space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: theme.primary }} />
                <div>
                  <p className="font-bold text-[#2D1E17]">Date</p>
                  <p className="text-sm text-[#6B5A4E]">{format(new Date(event.start_time), 'EEEE, dd MMMM yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: theme.primary }} />
                <div>
                  <p className="font-bold text-[#2D1E17]">Time</p>
                  <p className="text-sm text-[#6B5A4E]">
                    {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: theme.primary }} />
                <div>
                  <p className="font-bold text-[#2D1E17]">Venue</p>
                  <p className="text-sm text-[#6B5A4E] leading-relaxed">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-50">
              {isRegistered ? (
                <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 text-green-700 text-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">You're signed up!</span>
                </div>
              ) : (
                <Button 
                  onClick={handleRegisterClick}
                  disabled={isRegistering}
                  className="w-full text-white rounded-xl font-bold h-12 shadow-lg transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 10px 25px -5px ${theme.primary}40`
                  }}
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : content.registerButtonText}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#2D1E17]">One last thing!</CardTitle>
              <CardDescription>
                Since it's your first time, please let us know your full name for our records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4A3728]">Full Name</label>
                <Input 
                  placeholder="Enter your full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowNamePrompt(false)} className="flex-1 rounded-xl h-12 font-bold">
                  Cancel
                </Button>
                <Button 
                  disabled={!fullName.trim() || isRegistering}
                  onClick={handleConfirmRegistration}
                  className="flex-1 text-white rounded-xl h-12 font-bold shadow-lg"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 10px 25px -5px ${theme.primary}40`
                  }}
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete & Sign Up"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
