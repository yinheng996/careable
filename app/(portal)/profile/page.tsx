'use client';

import * as React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { getUserProfile, getUserRegistrations } from '@/app/actions/participant';
import { isFuture } from 'date-fns';
import { 
  User,
  Mail,
  Calendar,
  Shield,
  Award,
  Loader2,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export default function ProfilePage() {
  const { user } = useUser();
  const { userId } = useAuth();
  const { role, theme, isVolunteer } = useUserRole();
  const [profile, setProfile] = React.useState<any>(null);
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const [profileResult, regsResult] = await Promise.all([
        getUserProfile(),
        getUserRegistrations()
      ]);
      
      if (profileResult.success) {
        setProfile(profileResult.data);
      }
      
      if (regsResult.success) {
        setRegistrations(regsResult.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Role-specific content
  const content = {
    volunteer: {
      roleLabel: 'Volunteer',
      roleIcon: Heart,
      accountDesc: 'Your Careable volunteer account',
      memberSinceLabel: 'Volunteering Since',
      thankYouTitle: 'Thank You for Volunteering!',
      thankYouMessage: 'Your dedication helps create meaningful experiences for children and families in our community.'
    },
    caregiver: {
      roleLabel: 'Caregiver',
      roleIcon: Heart,
      accountDesc: 'Your Careable caregiver account',
      memberSinceLabel: 'Caregiver Since',
      thankYouTitle: 'Thank You for Caring!',
      thankYouMessage: 'Your commitment to helping participants access meaningful activities makes a real difference.'
    },
    participant: {
      roleLabel: 'Participant',
      roleIcon: Heart,
      accountDesc: 'Your Careable participant account',
      memberSinceLabel: 'Member Since',
      thankYouTitle: 'Welcome to Careable!',
      thankYouMessage: 'We are here to support your wellness journey and help you discover activities you love.'
    }
  }[role];

  const RoleIcon = content.roleIcon;

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
        <p className="text-[#6B5A4E] font-medium text-center">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="px-4 pt-6 pb-12 border-b"
        style={{
          background: `linear-gradient(to bottom right, white, ${theme.light}, ${theme.light})`,
          borderColor: `${theme.primary}1A`
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2" style={{ color: theme.primary }}>
            <User className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-zinc-100 p-6 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl text-white font-bold shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.dark})`
                }}
              >
                {user?.firstName?.[0] || profile?.full_name?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#2D1E17]">
                  {profile?.full_name || user?.fullName || content.roleLabel}
                </h1>
                <p className="text-[#6B5A4E] text-sm mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1"
                    style={{
                      backgroundColor: `${theme.light}`,
                      color: theme.primary
                    }}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {content.roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {registrations.filter(r => r.status === 'attended').length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">{isVolunteer ? 'Events Helped' : 'Events Attended'}</div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {registrations.filter(r => isFuture(new Date(r.events.start_time))).length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">Upcoming</div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 text-center border border-zinc-100">
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {registrations.length}
              </div>
              <div className="text-xs text-[#6B5A4E] mt-1">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Account Information */}
        <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#2D1E17]">Account Information</h2>
                <p className="text-xs text-[#6B5A4E]">{content.accountDesc}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
              <Mail className="w-5 h-5 text-[#6B5A4E]" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] font-medium">Email Address</p>
                <p className="text-sm text-[#2D1E17] font-semibold">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
              <Calendar className="w-5 h-5 text-[#6B5A4E]" />
              <div className="flex-1">
                <p className="text-xs text-[#6B5A4E] font-medium">{content.memberSinceLabel}</p>
                <p className="text-sm text-[#2D1E17] font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'long' }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button 
            className="w-full flex items-center justify-between p-5 bg-white backdrop-blur-sm rounded-2xl border-2 border-zinc-100 hover:shadow-lg transition-all group"
            style={{
              borderColor: '#f4f4f5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#f4f4f5';
            }}
          >
            <span className="font-semibold text-[#2D1E17]">
              Edit Personal Information
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            className="w-full flex items-center justify-between p-5 bg-white backdrop-blur-sm rounded-2xl border-2 border-zinc-100 hover:shadow-lg transition-all group"
            style={{
              borderColor: '#f4f4f5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#f4f4f5';
            }}
          >
            <span className="font-semibold text-[#2D1E17]">
              {isVolunteer ? 'Volunteer Preferences' : 'Preferences'}
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            className="w-full flex items-center justify-between p-5 bg-white backdrop-blur-sm rounded-2xl border-2 border-zinc-100 hover:shadow-lg transition-all group"
            style={{
              borderColor: '#f4f4f5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#f4f4f5'
            }}
          >
            <span className="font-semibold text-[#2D1E17]">
              Notification Settings
            </span>
            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Thank You Card */}
        <div 
          className="rounded-3xl p-8 text-center text-white shadow-xl"
          style={{
            background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.dark})`
          }}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl mb-2">{content.thankYouTitle}</h3>
          <p className="text-white/90 text-sm">
            {content.thankYouMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
