'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'
import type { UserRole } from '@/lib/supabase/model'

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = React.useState<UserRole | null>(null)
  const [isCaregiver, setIsCaregiver] = React.useState(false)
  const [membershipType, setMembershipType] = React.useState('Ad hoc')
  const [staffEmail, setStaffEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleComplete = async (selectedRole: UserRole) => {
    setLoading(true)
    
    // If they are a participant but checked the caregiver box, set role to caregiver
    const finalRole = (selectedRole === 'participant' && isCaregiver) ? 'caregiver' : selectedRole;

    const result = await completeOnboarding({
      role: finalRole,
      membershipType: selectedRole === 'participant' ? membershipType : undefined,
      email: selectedRole === 'staff' ? staffEmail : undefined,
    })

    if (result.success) {
      router.push(`/${finalRole}/dashboard`)
    } else {
      alert(result.error || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-[#4A3728]">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[#2D1E17]">Welcome to Careable</h1>
          <p className="text-lg text-[#6B5A4E]">Let's get you set up. How will you be using the platform?</p>
        </div>

        {/* Role Selection Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Participant / Caregiver Card */}
          <div 
            onClick={() => setRole('participant')}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-6 bg-white shadow-sm hover:shadow-md ${
              role === 'participant' ? 'border-[#E89D71] ring-2 ring-[#E89D71]/20' : 'border-zinc-100'
            }`}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#FEF3EB] rounded-2xl flex items-center justify-center text-2xl">🧸</div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D1E17]">Participant / Caregiver</h2>
                <p className="text-[#6B5A4E] mt-1">I want to join events or manage them for a child.</p>
              </div>
            </div>

            {role === 'participant' && (
              <div className="pt-4 border-t border-zinc-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isCaregiver}
                    onChange={(e) => setIsCaregiver(e.target.checked)}
                    className="w-5 h-5 rounded border-[#E89D71] text-[#E89D71] focus:ring-[#E89D71]"
                  />
                  <span className="text-sm font-medium">Are you a caregiver filling this on behalf of a child?</span>
                </label>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Membership Type</label>
                  <select 
                    value={membershipType}
                    onChange={(e) => setMembershipType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E89D71]/20"
                  >
                    <option>Ad hoc</option>
                    <option>Once a week</option>
                    <option>Twice a week</option>
                    <option>3+ times a week</option>
                  </select>
                </div>

                <button 
                  disabled={loading}
                  onClick={() => handleComplete('participant')}
                  className="w-full py-3 px-4 bg-[#E89D71] text-white rounded-xl font-bold hover:bg-[#D88C61] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Start as Participant'}
                </button>
              </div>
            )}
          </div>

          {/* Volunteer Card */}
          <div 
            onClick={() => setRole('volunteer')}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-6 bg-white shadow-sm hover:shadow-md ${
              role === 'volunteer' ? 'border-[#86B1A4] ring-2 ring-[#86B1A4]/20' : 'border-zinc-100'
            }`}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#E8F3F0] rounded-2xl flex items-center justify-center text-2xl">🤝</div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D1E17]">Volunteer</h2>
                <p className="text-[#6B5A4E] mt-1">I want to give my time and support events.</p>
              </div>
            </div>

            {role === 'volunteer' && (
              <div className="pt-4 border-t border-zinc-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-[#6B5A4E]">Thank you for your interest in volunteering! You'll be able to browse and sign up for upcoming events.</p>
                <button 
                  disabled={loading}
                  onClick={() => handleComplete('volunteer')}
                  className="w-full py-3 px-4 bg-[#86B1A4] text-white rounded-xl font-bold hover:bg-[#729A8D] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Start as Volunteer'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Staff Prototype Logic */}
        <div className="pt-8 text-center border-t border-zinc-100">
          {role !== 'staff' ? (
            <button 
              onClick={() => setRole('staff')}
              className="text-sm text-[#6B5A4E] hover:text-[#2D1E17] font-medium transition-colors"
            >
              Are you a staff member?
            </button>
          ) : (
            <div className="max-w-sm mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-[#2D1E17]">Staff Portal Access</h3>
              <input 
                type="email" 
                placeholder="Enter staff email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E89D71]/20"
              />
              <div className="flex space-x-2">
                <button 
                  onClick={() => setRole(null)}
                  className="flex-1 py-2 text-sm font-medium text-[#6B5A4E] hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading || !staffEmail}
                  onClick={() => handleComplete('staff')}
                  className="flex-[2] py-2 bg-[#2D1E17] text-white rounded-lg text-sm font-bold hover:bg-[#1A110D] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Request Access'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
