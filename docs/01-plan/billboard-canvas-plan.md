# PDCA Plan: The Billboard Canvas

## 1. Project Overview
**Name**: The Billboard Canvas
**Level**: Starter → Dynamic (AI API integration)
**Goal**: Interactive prototype for billboard ad business owners - users take a webcam photo, AI analyzes them, swaps their face into an ad template, and generates a video for billboard playback.

## 2. Template Assets Inventory
| File | People | Mood | Colors | Ratio |
|------|--------|------|--------|-------|
| 001.jpg | 1 (woman) | Luxury, elegant | Warm orange/brown | 16:9 |
| 001.webp | 1 (woman) | Garden, relaxed | Warm, natural greens | 4:3 |
| 002.jpg | 1 (woman) | Athletic, powerful | Dark, high contrast | 4:3 |
| 003.webp | 4 (women) | High fashion, dramatic | Beige/brown, ocean | 16:9 |
| 004.jpg | 1 (woman) | Mystical, artistic | Teal/black, sparkle | 16:9 |
| 005.jpg | 2 (couple) | Classic, warm | Beige plaid, vintage | 16:9 |
| 006.jpg | 2 (man+woman) | Eclectic, fun | Colorful, sky blue | 16:9 |
| 007.jpg | 2 (woman+man) | Luxury outdoor | Earth/brown tones | 16:9 |

## 3. Tech Stack
- **Framework**: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **LLM/Vision**: Gemini 2.0 Flash (`gemini-2.0-flash`) - user analysis & text
- **Image Gen**: Nanobanana Pro (`imagen-3.0-generate-002` or `nano-banana-pro-preview`) - face swap
- **Video Gen**: RunwayML Gen-3 Alpha Turbo - image-to-video
- **Env vars**: GEMINI_API_KEY, RUNWAYML_API_SECRET

## 4. User Flow (5 Steps)
```
[Step 1] App Init → Gemini scans /public/images → metadata cached
    ↓
[Step 2] Intro Page → "Take a Shot" → Webcam capture
    ↓
[Step 3] Gemini analyzes user → witty compliment displayed
    ↓
[Step 4] Nanobanana face swap → billboard image shown + witty message
    ↓
[Step 5] RunwayML video gen (background) → auto-replace image with video
```

## 5. API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/analyze-templates` | POST | Scan templates with Gemini, return metadata |
| `/api/analyze-user` | POST | Analyze user photo, return witty feedback |
| `/api/faceswap` | POST | Nanobanana face swap with selected template |
| `/api/generate-video` | POST | RunwayML image-to-video |
| `/api/video-status/[taskId]` | GET | Poll RunwayML video generation status |

## 6. Component Structure
```
src/
├── app/
│   ├── layout.tsx              # Dark theme root layout
│   ├── page.tsx                # Main orchestrator (step state machine)
│   ├── globals.css             # Apple-style global styles
│   └── api/
│       ├── analyze-templates/route.ts
│       ├── analyze-user/route.ts
│       ├── faceswap/route.ts
│       ├── generate-video/route.ts
│       └── video-status/[taskId]/route.ts
├── components/
│   ├── IntroScreen.tsx         # Hero + "Take a Shot" button
│   ├── CameraCapture.tsx       # Webcam component
│   ├── AnalysisScreen.tsx      # Witty feedback display
│   ├── BillboardResult.tsx     # Face swap result + message
│   ├── VideoPlayer.tsx         # Auto-play billboard video
│   └── LoadingOverlay.tsx      # Elegant loading animations
└── lib/
    ├── gemini.ts               # Gemini API client
    ├── nanobanana.ts           # Nanobanana API client
    ├── runway.ts               # RunwayML API client
    └── templates.ts            # Template metadata types & cache
```

## 7. Design Direction
- **Style**: Apple-inspired minimalism
- **Background**: Pure black (#000)
- **Text**: White, SF Pro-like (Inter font)
- **Accents**: Subtle gradients, glass morphism
- **Animations**: Smooth fade-in, scale transitions, cinematic reveals
- **Loading**: Elegant pulse animations with witty copy

## 8. Team Assignment
| Role | Scope |
|------|-------|
| **Lead** | PDCA docs, coordination, integration |
| **Backend Dev** | All 5 API routes, API clients in lib/ |
| **Frontend Dev** | All components, page flow, animations |

## 9. Risk & Mitigation
- **Gemini rate limits**: Cache template analysis results
- **Nanobanana failure**: Show graceful error with retry option
- **RunwayML slow (60s+)**: Background generation with progress indicator
- **Webcam permission denied**: Fallback to file upload
