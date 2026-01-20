This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Calendar Event Extractor (Staff Portal)

A portable event-extraction module for the Staff Portal, using Google Gemini API. This version includes specific categorization for Singapore-based caregiving services.

#### Features
- Extracts structured JSON events from images (PNG, JPEG, WebP), PDFs, and PPTX files.
- **Auto-Categorization**: Social Outing, Arts & Crafts, Life Skills, Sports & Fitness, Music Session.
- **Location Awareness**: Automatically identifies the area of Singapore (North, South, East, West, Central).
- **Vercel Ready**: No local binary dependencies.
- **Staff-Specific**: Located within the `app/(staff)/staff` directory.

#### Tech Stack
- Next.js App Router
- `@google/generative-ai`
- Zod + zod-to-json-schema

#### Installation
1. Install dependencies:
   ```bash
   npm install @google/generative-ai zod zod-to-json-schema
   ```
2. Set environment variables:
   ```env
   GEMINI_API_KEY=your_key
   GEMINI_MODEL=gemini-1.5-flash
   ```

#### API Endpoint
`POST /staff/api/calendar/extract`

- **Body**: `multipart/form-data`
- **Field**: `file` (max 4.5MB)

#### Example Response
```json
{
  "meta": {
    "source_filename": "calendar.pdf",
    "source_mime": "application/pdf",
    "calendar_type": "monthly_grid"
  },
  "events": [
    {
      "event_name": "Painting Class",
      "date_iso": "2026-02-15",
      "date_text": "15 Feb",
      "start_time": "14:00",
      "end_time": "16:00",
      "location": "Tampines Hub",
      "singapore_area": "East",
      "category": "Arts & Crafts",
      "notes": "Bring your own apron",
      "source_text": "2pm Painting @ Tampines Hub"
    }
  ]
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
