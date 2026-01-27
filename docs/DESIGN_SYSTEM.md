# 🎨 Careable Design System

## Overview

A professional, accessible design system for serving participants with special needs, caregivers, volunteers, and staff.

---

## Core Principles

### 1. **Accessibility First**
- WCAG 2.1 AA compliant
- High contrast ratios (minimum 4.5:1)
- Support for font scaling
- Clear focus states
- Screen reader friendly

### 2. **Plain Language**
- Simple, clear wording
- No jargon
- Short sentences
- Active voice

### 3. **Consistent Layouts**
- Predictable patterns
- Clear visual hierarchy
- Mobile-first approach
- Generous spacing

### 4. **Descriptive Actions**
- Button labels describe the action
- No vague "Click here" or "Submit"
- Examples: "Register for Event", "Show QR Code"

### 5. **Simple Colors**
- Limited palette
- Clear meaning
- High contrast
- Colorblind-friendly

---

## Color Palette

### Brand Colors

#### Volunteer (Teal/Green)
- **Primary:** `#86B1A4` - Main brand color
- **Dark:** `#6FA08F` - Gradients, hover states
- **Light:** `#E8F3F0` - Backgrounds
- **Usage:** Volunteer portal, volunteer-related actions

#### Participant (Warm Orange)
- **Primary:** `#E89D71` - Main brand color
- **Dark:** `#D88C61` - Gradients, hover states
- **Light:** `#FEF3EB` - Backgrounds
- **Usage:** Participant/caregiver portal, participant-related actions

### Neutral Colors

#### Light Mode
- **Background:** `#FFFFFF` (White)
- **Surface:** `#F9FAFB` (Off-white)
- **Border:** `#E5E7EB` (Light gray)
- **Text Primary:** `#2D1E17` (Dark brown - warm)
- **Text Secondary:** `#6B5A4E` (Medium brown)
- **Text Tertiary:** `#9CA3AF` (Light gray)

#### Dark Mode
- **Background:** `#0a0a0a` (Soft black)
- **Surface:** `#18181b` (Zinc 900)
- **Border:** `#27272a` (Zinc 800)
- **Text Primary:** `#f5f5f5` (Soft white)
- **Text Secondary:** `#d4d4d8` (Zinc 300)
- **Text Tertiary:** `#a1a1aa` (Zinc 400)

### Semantic Colors

#### Success
- **Color:** `#10B981` (Green 500)
- **Background:** `#D1FAE5` (Green 100)
- **Usage:** Success messages, completed states

#### Warning
- **Color:** `#F59E0B` (Amber 500)
- **Background:** `#FEF3C7` (Amber 100)
- **Usage:** Warning messages, pending states

#### Error
- **Color:** `#EF4444` (Red 500)
- **Background:** `#FEE2E2` (Red 100)
- **Usage:** Error messages, destructive actions

#### Info
- **Color:** `#3B82F6` (Blue 500)
- **Background:** `#DBEAFE` (Blue 100)
- **Usage:** Informational messages

---

## Typography

### Font Family
- **Primary:** System UI fonts
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Why:** Fast loading, native feel, excellent readability

### Font Sizes

#### Desktop Scale
- **Hero:** `48px` (3rem) - Major headings
- **H1:** `36px` (2.25rem) - Page titles
- **H2:** `30px` (1.875rem) - Section headings
- **H3:** `24px` (1.5rem) - Subsections
- **Body Large:** `18px` (1.125rem) - Important text
- **Body:** `16px` (1rem) - Default text
- **Body Small:** `14px` (0.875rem) - Secondary text
- **Caption:** `12px` (0.75rem) - Labels, metadata

#### Mobile Scale (Slightly Larger)
- **Hero:** `36px` (2.25rem)
- **H1:** `30px` (1.875rem)
- **H2:** `24px` (1.5rem)
- **H3:** `20px` (1.25rem)
- **Body Large:** `18px` (1.125rem)
- **Body:** `16px` (1rem)
- **Body Small:** `14px` (0.875rem)
- **Caption:** `12px` (0.75rem)

### Font Weights
- **Bold:** `700` - Headings, emphasis
- **Semibold:** `600` - Subheadings, buttons
- **Medium:** `500` - Labels
- **Regular:** `400` - Body text

### Line Height
- **Headings:** `1.2` (Tight)
- **Body:** `1.5` (Normal)
- **Small Text:** `1.4` (Slightly tight)

### Font Scaling
Users can select:
- **Small:** `0.9x` scale
- **Medium:** `1.0x` scale (default)
- **Large:** `1.15x` scale

---

## Spacing Scale

Consistent spacing using 4px base unit:

- **2xs:** `4px` (0.25rem)
- **xs:** `8px` (0.5rem)
- **sm:** `12px` (0.75rem)
- **md:** `16px` (1rem) - Default
- **lg:** `24px` (1.5rem)
- **xl:** `32px` (2rem)
- **2xl:** `48px` (3rem)
- **3xl:** `64px` (4rem)

### Common Usage
- **Button padding:** `12px 24px` (sm lg)
- **Card padding:** `24px` (lg)
- **Section spacing:** `48px` (2xl)
- **Component gaps:** `16px` (md)

---

## Components

### Buttons

#### Sizes
- **Large:** `px-8 py-4 text-lg` - Mobile CTAs
- **Default:** `px-6 py-3 text-base` - Most buttons
- **Small:** `px-4 py-2 text-sm` - Secondary actions

#### Variants

**Primary (Volunteer)**
```tsx
className="
  bg-[#86B1A4] 
  text-white 
  hover:bg-[#6FA08F] 
  active:bg-[#5E8F7E]
  font-semibold 
  rounded-xl 
  shadow-lg
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

**Primary (Participant)**
```tsx
className="
  bg-[#E89D71] 
  text-white 
  hover:bg-[#D88C61] 
  active:bg-[#C77B51]
  font-semibold 
  rounded-xl 
  shadow-lg
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

**Secondary**
```tsx
className="
  bg-white 
  dark:bg-zinc-900 
  text-[#2D1E17] 
  dark:text-white
  border-2 border-zinc-200 
  dark:border-zinc-700
  hover:border-[#86B1A4] 
  dark:hover:border-[#86B1A4]
  font-semibold 
  rounded-xl
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

**Destructive**
```tsx
className="
  bg-red-500 
  text-white 
  hover:bg-red-600 
  active:bg-red-700
  font-semibold 
  rounded-xl 
  shadow-lg
  transition-all duration-200
"
```

#### Button Labels (Examples)
- ✅ "Register for Event"
- ✅ "Show QR Code"
- ✅ "Save Changes"
- ✅ "Send Message"
- ❌ "Submit"
- ❌ "Click here"
- ❌ "OK"

### Cards

#### Standard Card
```tsx
className="
  bg-white 
  dark:bg-zinc-900/50 
  backdrop-blur-sm
  rounded-3xl 
  border-2 
  border-zinc-100 
  dark:border-zinc-800/50
  p-6
  shadow-sm 
  dark:shadow-zinc-900/50
  hover:shadow-lg 
  dark:hover:shadow-zinc-900
  transition-all duration-300
"
```

#### Interactive Card (Clickable)
```tsx
className="
  bg-white 
  dark:bg-zinc-900/50
  rounded-3xl 
  border-2 
  border-zinc-100 
  dark:border-zinc-800/50
  p-6
  hover:border-[#86B1A4] 
  hover:shadow-lg
  dark:hover:shadow-[#86B1A4]/20
  transition-all duration-300
  cursor-pointer
"
```

### Form Inputs

#### Text Input
```tsx
className="
  w-full 
  px-4 py-3
  rounded-xl 
  border-2 
  border-zinc-200 
  dark:border-zinc-700
  bg-white 
  dark:bg-zinc-900
  text-[#2D1E17] 
  dark:text-white
  focus:border-[#86B1A4] 
  focus:ring-2 
  focus:ring-[#86B1A4]/20
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

#### Label
```tsx
className="
  block 
  text-sm 
  font-medium 
  text-[#2D1E17] 
  dark:text-white
  mb-2
"
```

#### Error Message
```tsx
className="
  text-sm 
  text-red-500 
  mt-1
  flex items-center gap-1
"
```

### Badges

#### Status Badge
```tsx
// Success
className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-bold"

// Warning
className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold"

// Error
className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-bold"

// Info
className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold"
```

---

## Accessibility Guidelines

### 1. **Color Contrast**
- Text on background: minimum 4.5:1
- Large text (18px+): minimum 3:1
- Interactive elements: minimum 3:1

### 2. **Touch Targets**
- Minimum size: `44px × 44px`
- Adequate spacing between targets: `8px`

### 3. **Focus States**
- Always visible focus ring
- High contrast
- Never remove `:focus` styles

### 4. **Keyboard Navigation**
- All interactive elements keyboard accessible
- Logical tab order
- Skip links for main content

### 5. **Screen Readers**
- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels when needed
- Alt text for images
- Descriptive link text

### 6. **Font Scaling**
- Support user font size preferences
- Test at 200% zoom
- No horizontal scrolling

### 7. **Motion**
- Respect `prefers-reduced-motion`
- Disable animations when requested

---

## Layout Patterns

### Container Widths
- **Narrow:** `max-w-2xl` (672px) - Forms, focused content
- **Standard:** `max-w-4xl` (896px) - Most pages
- **Wide:** `max-w-6xl` (1152px) - Dashboards, tables
- **Full:** `max-w-7xl` (1280px) - Hero sections

### Mobile Padding
- **Standard:** `px-4` (16px)
- **Tight:** `px-3` (12px) - Dense layouts
- **Generous:** `px-6` (24px) - Hero sections

### Vertical Spacing
- **Section gap:** `space-y-6` (24px) - Between sections
- **Component gap:** `space-y-4` (16px) - Between components
- **Content gap:** `space-y-2` (8px) - Between related items

---

## Animation & Transitions

### Duration
- **Fast:** `150ms` - Micro-interactions (button hover)
- **Normal:** `200ms` - Standard transitions
- **Slow:** `300ms` - Complex transitions (card hover)

### Easing
- **Default:** `ease-in-out` - Most transitions
- **Bounce:** Use sparingly for delight

### Common Transitions
```css
transition-all duration-200
transition-colors duration-150
transition-transform duration-300
```

---

## Writing Style

### Headings
- Clear and descriptive
- Start with action words when possible
- Keep under 60 characters

**Examples:**
- ✅ "Register for Art Workshop"
- ✅ "Your Upcoming Events"
- ❌ "Registration"
- ❌ "Events"

### Body Text
- Short sentences (under 20 words)
- Active voice
- Second person ("you", not "users")
- One idea per sentence

**Examples:**
- ✅ "Show this QR code to staff at the event."
- ✅ "You have registered for 3 events."
- ❌ "The QR code should be presented to event staff for check-in purposes."
- ❌ "Your account currently has 3 event registrations pending."

### Button Labels
- Start with verbs
- Describe the action
- Keep under 4 words

**Examples:**
- ✅ "Register for Event"
- ✅ "Show QR Code"
- ✅ "Send Message"
- ❌ "Next"
- ❌ "Submit Form"

### Error Messages
- Explain what went wrong
- Tell user how to fix it
- Be friendly, not blaming

**Examples:**
- ✅ "We couldn't find that email. Please check the spelling."
- ✅ "This event is full. Try another date."
- ❌ "Invalid input."
- ❌ "Error 404."

---

## Dark Mode

### Approach
- User-controlled toggle (not system preference)
- Default to light mode
- Smooth transitions

### Colors
- Softer darks (`#0a0a0a` not `#000000`)
- Softer whites (`#f5f5f5` not `#ffffff`)
- Glassmorphism for depth (`backdrop-blur-sm`)
- Semi-transparent borders

### Implementation
```css
/* Tailwind classes */
bg-white dark:bg-[#0a0a0a]
text-[#2D1E17] dark:text-white
border-zinc-100 dark:border-zinc-800/50
```

---

## Icon Usage

### Guidelines
- Always pair with text labels
- Use outline style for consistency
- Size: 20px (md), 24px (lg)
- Colors match text color

### Common Icons (Lucide React)
- **Home:** `<Home />`
- **Events:** `<Calendar />`
- **Profile:** `<User />`
- **Settings:** `<Settings />`
- **Search:** `<Search />`
- **Add:** `<Plus />`
- **Close:** `<X />`
- **Check:** `<Check />`
- **Arrow:** `<ChevronRight />`

---

## Responsive Breakpoints

```javascript
{
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### Mobile-First Approach
- Design for mobile first
- Progressively enhance for larger screens
- Touch targets: minimum 44×44px
- Thumbs zone: bottom 1/3 of screen

---

## Testing Checklist

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast passes WCAG AA
- [ ] Focus states visible
- [ ] Alt text on images
- [ ] Forms have labels

### Responsiveness
- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Landscape orientation

### Dark Mode
- [ ] All text readable
- [ ] All borders visible
- [ ] No pure black/white
- [ ] Smooth transitions

### Performance
- [ ] Fonts load quickly
- [ ] Images optimized
- [ ] Animations smooth (60fps)
- [ ] No layout shift

---

## Resources

### Tools
- **Color Contrast Checker:** [WebAIM](https://webaim.org/resources/contrastchecker/)
- **Font Testing:** [Type Scale](https://type-scale.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Accessibility:** [axe DevTools](https://www.deque.com/axe/devtools/)

### References
- **WCAG 2.1:** [W3C Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **Plain Language:** [PlainLanguage.gov](https://www.plainlanguage.gov/)
- **Inclusive Design:** [Microsoft Design](https://www.microsoft.com/design/inclusive/)

---

*Last updated: January 2026*
