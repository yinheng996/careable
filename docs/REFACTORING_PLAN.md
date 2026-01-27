# 🔄 Project Refactoring Plan

## Current Issues

1. **Duplicated Route Groups:** `(volunteer)`, `(participant)`, `(participant)/caregiver` have nearly identical pages
2. **Redundant Layouts:** Multiple layout files doing similar things
3. **Hard to Maintain:** Changes need to be replicated across 3+ folders
4. **Complex Structure:** Hard for new developers to understand
5. **Color Themes:** Currently hardcoded per route, should be role-based

---

## Proposed New Structure

### 📁 Simplified Architecture

```
app/
├── (auth)/                    # Keep as-is (sign-in, sign-up)
├── (landing)/                 # Keep as-is (marketing page)
├── (admin)/                   # Keep as-is (admin dashboard)
├── (staff)/                   # Keep as-is (staff dashboard)
├── (onboarding)/              # Keep as-is (first-time setup)
│
├── (portal)/                  # 🆕 UNIFIED USER PORTAL
│   ├── layout.tsx             # Single layout with role-based theming
│   ├── dashboard/
│   │   └── page.tsx           # Adapts content based on user role
│   ├── events/                # Unified: volunteer opportunities + participant events
│   │   ├── page.tsx           # Lists events (filtered by role)
│   │   └── [id]/
│   │       └── page.tsx       # Event details + registration
│   ├── profile/
│   │   └── page.tsx           # User profile (same for all)
│   ├── registrations/
│   │   └── page.tsx           # My registered events
│   └── participants/          # 🆕 CAREGIVER ONLY
│       └── page.tsx           # Manage participants (caregiver-specific)
│
├── actions/
│   ├── events.ts              # Unified event actions
│   └── preferences.ts
├── api/                       # Keep as-is
├── design-system/             # Keep as-is
├── globals.css
└── layout.tsx
```

---

## Color Theme System

### Dynamic Role-Based Theming

Instead of separate layouts for each role, use **CSS variables + role detection**:

```typescript
// components/RoleThemeProvider.tsx
const ROLE_THEMES = {
  volunteer: {
    primary: '#86B1A4',      // Green
    dark: '#6FA08F',
    light: '#E8F3F0'
  },
  caregiver: {
    primary: '#EC4899',      // Pink (rose-500)
    dark: '#DB2777',         // rose-600
    light: '#FCE7F3'         // rose-100
  },
  participant: {
    primary: '#E89D71',      // Orange
    dark: '#D88C61',
    light: '#FEF3EB'
  }
};

// Apply theme based on user role from Clerk/database
```

### CSS Variables Approach

```css
/* globals.css */
:root {
  --color-primary: #86B1A4;
  --color-primary-dark: #6FA08F;
  --color-primary-light: #E8F3F0;
}

[data-role="volunteer"] {
  --color-primary: #86B1A4;
  --color-primary-dark: #6FA08F;
  --color-primary-light: #E8F3F0;
}

[data-role="caregiver"] {
  --color-primary: #EC4899;
  --color-primary-dark: #DB2777;
  --color-primary-light: #FCE7F3;
}

[data-role="participant"] {
  --color-primary: #E89D71;
  --color-primary-dark: #D88C61;
  --color-primary-light: #FEF3EB;
}
```

Then use: `bg-[var(--color-primary)]` in components!

---

## Page Adaptation Strategy

### Example: Dashboard Page

```typescript
// app/(portal)/dashboard/page.tsx
export default async function DashboardPage() {
  const { role } = await getCurrentUser();
  
  return (
    <div>
      <h1>{translations[role].welcome}</h1>
      
      {role === 'volunteer' && <VolunteerStats />}
      {role === 'caregiver' && <CaregiverStats />}
      {role === 'participant' && <ParticipantStats />}
      
      {/* Common components */}
      <UpcomingEvents role={role} />
      <QuickActions role={role} />
    </div>
  );
}
```

### Example: Events Page

```typescript
// app/(portal)/events/page.tsx
export default async function EventsPage() {
  const { role, userId } = await getCurrentUser();
  
  // Fetch events based on role
  const events = await getEventsForRole(role, userId);
  
  return (
    <div>
      <h1>
        {role === 'volunteer' ? 'Volunteer Opportunities' : 'Events for You'}
      </h1>
      
      <EventGrid events={events} role={role} />
    </div>
  );
}
```

---

## Benefits of This Approach

### ✅ **For Developers:**
- **Single source of truth** - one page, one layout
- **Easy to maintain** - changes in one place
- **Clear responsibility** - each page knows what to show
- **Type safety** - role-based TypeScript types
- **Scalable** - easy to add new roles

### ✅ **For Users:**
- **Consistent UX** - similar flows across roles
- **Fast loading** - no duplicated code
- **Clear branding** - colors match their role
- **Intuitive** - same patterns, different colors

### ✅ **For Performance:**
- **Smaller bundle** - no duplicated components
- **Better caching** - same components reused
- **Faster builds** - fewer pages to compile

---

## Migration Plan

### Phase 1: Setup Infrastructure ✅
1. Create new `(portal)` route group
2. Create unified layout with role detection
3. Implement theme system with CSS variables
4. Create role-based helper utilities

### Phase 2: Migrate Pages 📝
1. **Dashboard** - merge volunteer/participant/caregiver dashboards
2. **Events** - merge opportunities/events into one
3. **Profile** - already similar, just move
4. **Registrations** - already similar, just move
5. **Participants** - caregiver-only, guard with role check

### Phase 3: Test & Verify ✅
1. Test all three roles
2. Verify colors display correctly
3. Check event filtering works
4. Ensure role-based access control
5. Test mobile responsiveness

### Phase 4: Cleanup 🗑️
1. Delete old route groups: `(volunteer)`, `(participant)`
2. Remove redundant layouts
3. Update imports
4. Clean up unused components

### Phase 5: Documentation 📚
1. Update README with new structure
2. Document role system
3. Add migration notes
4. Update design system docs

---

## Technical Implementation Details

### 1. Role Detection Hook

```typescript
// hooks/useUserRole.ts
export function useUserRole() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as UserRole;
  
  return {
    role,
    isVolunteer: role === 'volunteer',
    isCaregiver: role === 'caregiver',
    isParticipant: role === 'participant',
    theme: ROLE_THEMES[role]
  };
}
```

### 2. Server-Side Role Fetching

```typescript
// lib/auth.ts
export async function getCurrentUserRole(): Promise<UserRole> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  // Get from Clerk metadata or database
  const profile = await getUserProfile(userId);
  return profile.role;
}
```

### 3. Event Filtering

```typescript
// lib/events.ts
export async function getEventsForRole(
  role: UserRole,
  userId: string
) {
  const supabase = await createClient();
  
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'active');
  
  // Filter by target_audience
  if (role === 'volunteer') {
    query = query.in('target_audience', ['volunteers', 'both']);
  } else if (role === 'participant' || role === 'caregiver') {
    query = query.in('target_audience', ['participants', 'both']);
  }
  
  return query;
}
```

### 4. Conditional Components

```typescript
// components/RoleContent.tsx
export function RoleContent({ 
  volunteer, 
  caregiver, 
  participant 
}: RoleContentProps) {
  const { role } = useUserRole();
  
  if (role === 'volunteer') return volunteer;
  if (role === 'caregiver') return caregiver;
  if (role === 'participant') return participant;
  return null;
}

// Usage:
<RoleContent 
  volunteer={<VolunteerWelcome />}
  caregiver={<CaregiverWelcome />}
  participant={<ParticipantWelcome />}
/>
```

---

## File Changes Summary

### 🆕 Files to Create
- `app/(portal)/layout.tsx` - Unified layout
- `app/(portal)/dashboard/page.tsx` - Role-aware dashboard
- `app/(portal)/events/page.tsx` - Unified events listing
- `app/(portal)/events/[id]/page.tsx` - Event details
- `app/(portal)/profile/page.tsx` - User profile
- `app/(portal)/registrations/page.tsx` - My registrations
- `app/(portal)/participants/page.tsx` - Caregiver participants
- `components/RoleThemeProvider.tsx` - Theme system
- `hooks/useUserRole.ts` - Role detection
- `lib/role-utils.ts` - Role helpers

### 🗑️ Files to Delete
- `app/(volunteer)/` - entire folder
- `app/(participant)/` - entire folder
- `app/(participant)/caregiver/` - move to portal
- `VolunteerClientLayout.tsx`
- `ParticipantClientLayout.tsx`

### ✏️ Files to Update
- `globals.css` - add CSS variables for themes
- `app/actions/participant.ts` - rename to `events.ts`
- `components/PreferencesProvider.tsx` - add theme support

---

## Color Palette Reference

### Volunteer (Green) 🟢
- **Primary:** `#86B1A4` (current)
- **Dark:** `#6FA08F` (current)
- **Light:** `#E8F3F0` (current)

### Caregiver (Pink) 🌸
- **Primary:** `#EC4899` (rose-500)
- **Dark:** `#DB2777` (rose-600)
- **Light:** `#FCE7F3` (rose-100)
- **Alternative:** Could use `#F472B6` (pink-400) for brighter pink

### Participant (Orange) 🟠
- **Primary:** `#E89D71` (current)
- **Dark:** `#D88C61` (current)
- **Light:** `#FEF3EB` (current)

---

## Testing Checklist

### Functionality ✅
- [ ] Volunteer can see volunteer-targeted events
- [ ] Participant can see participant-targeted events
- [ ] Caregiver can see participant events + manage participants
- [ ] Registration flow works for all roles
- [ ] QR code generation works
- [ ] Profile editing works
- [ ] Language switching works
- [ ] Font size scaling works

### Visual ✅
- [ ] Volunteer sees green theme
- [ ] Caregiver sees pink theme
- [ ] Participant sees orange theme
- [ ] Theme applies to buttons
- [ ] Theme applies to cards
- [ ] Theme applies to navigation
- [ ] Dark mode removed (light only)

### Access Control ✅
- [ ] Volunteers can't access participant-only features
- [ ] Participants can't access caregiver-only features
- [ ] Caregivers can access participant management
- [ ] Unauthenticated users redirected

### Performance ✅
- [ ] Initial page load < 2s
- [ ] Navigation feels instant
- [ ] No layout shift
- [ ] Images optimized
- [ ] Bundle size reasonable

---

## Risk Assessment

### Low Risk ✅
- Creating new unified pages (can test separately)
- Implementing CSS variable themes (non-breaking)
- Adding role detection hooks (additive)

### Medium Risk ⚠️
- Migrating existing users (need data migration)
- Changing route structure (update all links)
- Removing old folders (backup first)

### Mitigation Strategy
1. **Feature flags** - deploy new portal alongside old
2. **Gradual rollout** - redirect one role at a time
3. **A/B testing** - compare performance
4. **Backup** - git branch before major changes
5. **Rollback plan** - keep old code for 1 week

---

## Timeline Estimate

### Day 1: Infrastructure (4-6 hours)
- Setup `(portal)` folder structure
- Implement CSS variable theme system
- Create role detection utilities
- Build unified layout

### Day 2: Core Pages (4-6 hours)
- Migrate dashboard
- Migrate events listing
- Migrate event details
- Test role-based rendering

### Day 3: Remaining Pages (3-4 hours)
- Migrate profile
- Migrate registrations
- Add caregiver participants page
- Polish styling

### Day 4: Testing & Cleanup (3-4 hours)
- Comprehensive testing
- Remove old folders
- Update documentation
- Deploy to production

**Total: ~14-20 hours**

---

## Questions to Consider

1. **Should we keep `/volunteer`, `/participant` URLs or use `/portal`?**
   - **Recommendation:** Use `/portal` for all, simpler routing

2. **Should caregivers see a different nav than participants?**
   - **Recommendation:** Yes, add "Participants" nav item for caregivers only

3. **Should we allow role switching in dev/staging?**
   - **Recommendation:** Yes, add dev-only role switcher

4. **Should we migrate data from old routes to new?**
   - **Recommendation:** Not needed if URL changes redirect properly

5. **Should we support multiple roles per user?**
   - **Recommendation:** Not initially, add later if needed

---

## Approval Required

Before proceeding with this refactoring, please confirm:

- [ ] ✅ Approve unified portal structure
- [ ] ✅ Approve color scheme (volunteer=green, caregiver=pink, participant=orange)
- [ ] ✅ Approve CSS variable approach for theming
- [ ] ✅ Approve role-based page adaptation strategy
- [ ] ✅ Approve timeline and phasing plan

Once approved, I'll begin implementation immediately!

---

*Prepared: January 2026*
*Status: AWAITING APPROVAL*
