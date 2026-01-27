'use client'

import * as React from 'react'
import { 
  Check, 
  X, 
  AlertCircle, 
  Info,
  Home,
  Calendar,
  User,
  Settings,
  Heart,
  Globe,
  Plus,
  ChevronRight,
  Search,
  Bell,
  Mail,
  MapPin,
  Clock
} from 'lucide-react'

export default function DesignSystemPage() {
  const [fontSize, setFontSize] = React.useState<'small' | 'medium' | 'large'>('medium')

  React.useEffect(() => {
    // Always ensure light mode
    const root = document.documentElement
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }, [])

  React.useEffect(() => {
    const scale = fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.15 : 1
    document.documentElement.style.setProperty('--font-scale', scale.toString())
  }, [fontSize])

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#86B1A4] to-[#6FA08F] text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Careable Design System</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            A professional, accessible design system for serving participants with special needs. Light theme only for clarity and consistency.
          </p>
          
          {/* Controls */}
          <div className="mt-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Font Size</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize('small')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    fontSize === 'small' 
                      ? 'bg-white text-[#86B1A4] shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    fontSize === 'medium' 
                      ? 'bg-white text-[#86B1A4] shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    fontSize === 'large' 
                      ? 'bg-white text-[#86B1A4] shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Large
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Colors */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Colors</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Simple colors with clear meaning and high contrast.</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Volunteer (Teal/Green)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#86B1A4] shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Primary</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#86B1A4</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#6FA08F] shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Dark</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#6FA08F</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#E8F3F0] border-2 border-zinc-200 dark:border-zinc-700"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Light</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#E8F3F0</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Participant (Warm Orange)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#E89D71] shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Primary</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#E89D71</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#D88C61] shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Dark</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#D88C61</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-[#FEF3EB] border-2 border-zinc-200 dark:border-zinc-700"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Light</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#FEF3EB</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-green-500 shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Success</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#10B981</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-amber-500 shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Warning</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#F59E0B</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-red-500 shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Error</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#EF4444</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-2xl bg-blue-500 shadow-lg"></div>
                  <p className="text-sm font-medium text-[#2D1E17] dark:text-white">Info</p>
                  <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">#3B82F6</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Typography</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Clear hierarchy with excellent readability.</p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">Hero (48px / 3rem)</p>
                <h1 className="text-5xl font-bold text-[#2D1E17] dark:text-white">Welcome to Careable</h1>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">H1 (36px / 2.25rem)</p>
                <h1 className="text-4xl font-bold text-[#2D1E17] dark:text-white">Page Title</h1>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">H2 (30px / 1.875rem)</p>
                <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white">Section Heading</h2>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">H3 (24px / 1.5rem)</p>
                <h3 className="text-2xl font-semibold text-[#2D1E17] dark:text-white">Subsection</h3>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">Body Large (18px / 1.125rem)</p>
                <p className="text-lg text-[#2D1E17] dark:text-white">Important information goes here.</p>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">Body (16px / 1rem)</p>
                <p className="text-base text-[#2D1E17] dark:text-white">This is the default body text size.</p>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">Small (14px / 0.875rem)</p>
                <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Secondary information.</p>
              </div>
              <div>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400 mb-2">Caption (12px / 0.75rem)</p>
                <p className="text-xs text-[#6B5A4E] dark:text-zinc-400">Labels and metadata.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Buttons</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Descriptive labels that explain the action clearly.</p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Primary (Volunteer)</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#86B1A4] text-white hover:bg-[#6FA08F] font-semibold rounded-xl shadow-lg transition-all duration-200">
                  Register for Event
                </button>
                <button className="px-6 py-3 bg-[#86B1A4] text-white hover:bg-[#6FA08F] font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  View Schedule
                </button>
                <button className="px-6 py-3 bg-[#86B1A4] text-white font-semibold rounded-xl shadow-lg opacity-50 cursor-not-allowed">
                  Event Full
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Primary (Participant)</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#E89D71] text-white hover:bg-[#D88C61] font-semibold rounded-xl shadow-lg transition-all duration-200">
                  Show QR Code
                </button>
                <button className="px-6 py-3 bg-[#E89D71] text-white hover:bg-[#D88C61] font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Save Event
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Secondary</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white border-2 border-zinc-200 dark:border-zinc-700 hover:border-[#86B1A4] font-semibold rounded-xl transition-all duration-200">
                  View Details
                </button>
                <button className="px-6 py-3 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white border-2 border-zinc-200 dark:border-zinc-700 hover:border-[#86B1A4] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Events
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Destructive</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-red-500 text-white hover:bg-red-600 font-semibold rounded-xl shadow-lg transition-all duration-200">
                  Cancel Registration
                </button>
                <button className="px-6 py-3 bg-red-500 text-white hover:bg-red-600 font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#2D1E17] dark:text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-8 py-4 bg-[#86B1A4] text-white hover:bg-[#6FA08F] font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg">
                  Large Button
                </button>
                <button className="px-6 py-3 bg-[#86B1A4] text-white hover:bg-[#6FA08F] font-semibold rounded-xl shadow-lg transition-all duration-200">
                  Default Button
                </button>
                <button className="px-4 py-2 bg-[#86B1A4] text-white hover:bg-[#6FA08F] font-semibold rounded-xl shadow-lg transition-all duration-200 text-sm">
                  Small Button
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Cards</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Consistent containers with clear hierarchy.</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 p-6 shadow-sm dark:shadow-zinc-900/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#86B1A4]/10 dark:bg-[#86B1A4]/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#86B1A4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D1E17] dark:text-white">Art Workshop</h3>
                  <p className="text-sm text-[#6B5A4E] dark:text-zinc-400">Saturday, 2:00 PM</p>
                </div>
              </div>
              <p className="text-[#2D1E17] dark:text-zinc-300 mb-4">
                Join us for a fun afternoon of painting and creativity.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                  Open
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[#6B5A4E] dark:text-zinc-300 rounded-full text-xs font-medium">
                  5 spots left
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border-2 border-zinc-100 dark:border-zinc-800/50 p-6 hover:border-[#86B1A4] hover:shadow-lg dark:hover:shadow-[#86B1A4]/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#E89D71]/10 dark:bg-[#E89D71]/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#E89D71]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D1E17] dark:text-white">Music Class</h3>
                  <p className="text-sm text-[#6B5A4E] dark:text-zinc-400">Sunday, 10:00 AM</p>
                </div>
              </div>
              <p className="text-[#2D1E17] dark:text-zinc-300 mb-4">
                Learn to play instruments in a supportive environment.
              </p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                  Almost Full
                </span>
                <ChevronRight className="w-5 h-5 text-[#6B5A4E] dark:text-zinc-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Form Inputs */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Form Inputs</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Clear labels with helpful feedback.</p>
          
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2D1E17] dark:text-white mb-2">
                Your Name
              </label>
              <input 
                type="text" 
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white focus:border-[#86B1A4] focus:ring-2 focus:ring-[#86B1A4]/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1E17] dark:text-white mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-red-500 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Please enter a valid email address.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1E17] dark:text-white mb-2">
                Special Needs (Optional)
              </label>
              <textarea 
                rows={4}
                placeholder="Tell us about any support you might need"
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white focus:border-[#86B1A4] focus:ring-2 focus:ring-[#86B1A4]/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D1E17] dark:text-white mb-2">
                Disabled Input
              </label>
              <input 
                type="text" 
                value="This field is disabled"
                disabled
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#2D1E17] dark:text-white opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Badges</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Clear status indicators with semantic colors.</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1E17] dark:text-white mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Confirmed
                </span>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Pending
                </span>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-bold flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Cancelled
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Information
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2D1E17] dark:text-white mb-3">Role Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-[#E8F3F0] dark:bg-[#86B1A4]/20 text-[#86B1A4] rounded-full text-sm font-bold">
                  Volunteer
                </span>
                <span className="px-3 py-1 bg-[#FEF3EB] dark:bg-[#E89D71]/20 text-[#E89D71] rounded-full text-sm font-bold">
                  Participant
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[#6B5A4E] dark:text-zinc-300 rounded-full text-sm font-medium">
                  Staff
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#2D1E17] dark:text-white mb-3">Count Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[#2D1E17] dark:text-white rounded-full text-xs font-medium">
                  3 new messages
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[#2D1E17] dark:text-white rounded-full text-xs font-medium">
                  12 spots left
                </span>
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                  5
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Icons</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Always paired with text labels for clarity.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Home className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Home</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Calendar className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Events</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <User className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Profile</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Settings className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Settings</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Bell className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Alerts</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Mail className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Messages</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <MapPin className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Location</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Heart className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Favorite</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Search className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Search</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Plus className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Add</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Globe className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Language</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Check className="w-6 h-6 text-[#2D1E17] dark:text-white" />
              <p className="text-sm text-[#6B5A4E] dark:text-zinc-300">Complete</p>
            </div>
          </div>
        </section>

        {/* Feedback Messages */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Feedback Messages</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Clear, helpful messages in plain language.</p>
          
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-900/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">Registration Complete!</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">You are registered for Art Workshop. We sent a confirmation email.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1">Almost Full</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Only 2 spots left for this event. Register soon to secure your place.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">Registration Failed</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">This event is now full. Please try another date or join the waiting list.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-900/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Important Information</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Remember to bring your QR code to the event. You can find it on your profile page.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-3xl font-bold text-[#2D1E17] dark:text-white mb-2">Spacing Scale</h2>
          <p className="text-[#6B5A4E] dark:text-zinc-300 mb-8">Consistent spacing using 4px base unit.</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1 bg-[#86B1A4]" style={{height: '4px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">2xs: 4px (0.25rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 bg-[#86B1A4]" style={{height: '8px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">xs: 8px (0.5rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 bg-[#86B1A4]" style={{height: '12px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">sm: 12px (0.75rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 bg-[#86B1A4]" style={{height: '16px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">md: 16px (1rem) - Default</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 bg-[#86B1A4]" style={{height: '24px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">lg: 24px (1.5rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 bg-[#86B1A4]" style={{height: '32px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">xl: 32px (2rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 bg-[#86B1A4]" style={{height: '48px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">2xl: 48px (3rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 bg-[#86B1A4]" style={{height: '64px'}}></div>
              <p className="text-sm text-[#2D1E17] dark:text-white font-mono">3xl: 64px (4rem)</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-center text-[#6B5A4E] dark:text-zinc-400">
          📖 Full documentation: <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">docs/DESIGN_SYSTEM.md</code>
        </p>
      </div>
    </div>
  )
}
