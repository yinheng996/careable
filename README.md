# 🧡 Careable

Careable is a centralized event management and community support platform designed specifically for caregiver organizations supporting children with disabilities. It streamlines event creation, volunteer coordination, participant registration, and attendance tracking through AI-powered automation and secure QR code systems.

**Version**: 0.2.0 (Migration 08 - January 2026)  
**Status**: Production Ready

## ✨ What's New in v0.2.0

### 🔧 Critical Fixes
- ✅ **TypeScript types updated** to match database schema (migrations 05-08)
- ✅ **QR scanner now uses rear camera** on mobile devices for staff check-ins
- ✅ **Enhanced AI extraction** with 95%+ accuracy through improved prompting and validation

### 🆕 New Features
- 🧡 **Caregiver Portal**: Link participants, register them for events, track special needs
- 📊 **Admin Analytics Dashboard**: Platform metrics, staff leaderboard, engagement tracking
- 👥 **Enhanced Attendance Tracking**: Records which staff performed check-ins with optional notes
- 🔗 **Participant Relationships**: Caregivers can manage multiple participants with full profiles
- 🎯 **Event Metadata**: Age restrictions, guardian requirements, target audience flags
- 📈 **Analytics Views**: Pre-built database views for event performance and user engagement

### 📦 Database Migration 08
Run the new migration to enable all features:
```bash
psql -h your-db.supabase.co -U postgres -f sql/08_enhanced_schema_caregiver_attendance.sql
```

## 🚀 Quick Start

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

For full setup instructions, see the [Project Summary](docs/01_PROJECT_SUMMARY.md).

## 🎯 Key Features

### 🏢 For Staff
- **AI-Powered Event Extraction**: Upload calendar images and let Gemini Vision extract events automatically
- **Event Management**: Create, edit, cancel events with capacity and accessibility tracking
- **QR Check-in System**: Scan participant QR codes using rear camera on mobile
- **Attendance Tracking**: Record who performed check-ins with optional notes
- **Singapore Venue Normalization**: Automatic mapping of common Singapore locations

### 🧡 For Caregivers (NEW)
- **Participant Management**: Link and manage multiple participants (children under care)
- **On-Behalf Registration**: Register participants for events
- **Special Needs Tracking**: Record accessibility requirements and emergency contacts
- **Consolidated Dashboard**: View all events and registrations in one place

### 👨‍👩‍👧‍👦 For Participants
- **Event Discovery**: Browse upcoming community events on mobile-friendly interface
- **One-Click Registration**: Seamless registration flow with QR code generation
- **Personal Dashboard**: Track upcoming events and attendance history

### 🤝 For Volunteers
- **Opportunity Discovery**: Browse volunteer opportunities by date and location
- **Self-Service Scheduling**: Manage your volunteer commitments
- **QR Code Access**: Quick access to attendance verification

### 📊 For Admins (NEW)
- **Platform Analytics**: Real-time metrics on users, events, and attendance
- **Staff Leaderboard**: Track events created and check-ins performed
- **Engagement Metrics**: Monitor top participants and volunteers
- **Geographic Insights**: Identify popular venues and event hotspots
- **Caregiver Program Stats**: Track caregiver adoption and managed participants

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.4 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Clerk (role-based access control)
- **AI**: Google Gemini 2.0 Flash (vision + reasoning)
- **QR**: qrcode (generation) + html5-qrcode (scanning with rear camera)
- **Security**: SHA-256 hashed tokens, RLS policies, staff attribution

## 📚 Documentation

- **[Project Summary](docs/01_PROJECT_SUMMARY.md)** - Complete technical documentation
- **[Cursor Prompt](docs/02_CURSOR_PROMPT.md)** - Development guidelines for AI assistants
- **[Improvement Plan](docs/03_IMPROVEMENT_PLAN.md)** - Roadmap and completed enhancements

## 🗄️ Database Setup

Execute migrations in order:

```bash
# 01-07: Base schema (already applied)
# 08: New caregiver and analytics features
psql -h your-db.supabase.co -U postgres -f sql/08_enhanced_schema_caregiver_attendance.sql
```

**What Migration 08 adds:**
- `caregiver_participants` table for managing relationships
- Enhanced `profiles` with language preference, special needs, emergency contact
- Enhanced `events` with age restrictions, guardian requirements, target audience
- Enhanced `registrations` with staff attribution and attendance notes
- Analytics views for reporting and dashboards

## 🔐 Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
