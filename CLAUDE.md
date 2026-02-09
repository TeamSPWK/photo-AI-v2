# The Billboard Canvas

## Project Level: Starter → Dynamic

## Overview
Interactive prototype for billboard ad business owners.
Users take a webcam photo → AI analyzes them → face swap into ad template → generate billboard video.
Apple-style minimalist dark UI.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **LLM/Vision**: Gemini 2.0 Flash (user analysis, text generation)
- **Image Gen**: Nanobanana Pro (face swap via Generative Language API)
- **Video Gen**: RunwayML Gen-3 Alpha Turbo (image-to-video)
- **Deployment**: Vercel

## Project Structure
```
src/
  app/
    layout.tsx                  # Dark theme root layout
    page.tsx                    # Main orchestrator (step state machine)
    globals.css                 # Apple-style dark theme + animations
    api/
      analyze-templates/route.ts  # Template metadata
      analyze-user/route.ts       # Gemini user analysis
      faceswap/route.ts           # Nanobanana face swap
      generate-video/route.ts     # RunwayML video start
      video-status/[taskId]/route.ts  # Video poll
  components/
    IntroScreen.tsx             # Hero + "Take a Shot"
    CameraCapture.tsx           # Webcam capture
    AnalysisScreen.tsx          # Witty feedback display
    BillboardResult.tsx         # Face swap result
    VideoPlayer.tsx             # Auto-play billboard video
    LoadingOverlay.tsx          # Elegant loading
  lib/
    gemini.ts                   # Gemini API client
    nanobanana.ts               # Nanobanana API client
    runway.ts                   # RunwayML API client
    templates.ts                # Template metadata & selection
public/
  images/                       # Ad template images (001-007)
docs/
  01-plan/                      # PDCA Plan
  02-design/                    # PDCA Design
```

## Environment Variables
- `GEMINI_API_KEY` - Google AI Studio key (Gemini + Nanobanana)
- `RUNWAYML_API_SECRET` - RunwayML API key

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build

## User Flow
INIT → INTRO → CAMERA → ANALYZING → FACESWAP → BILLBOARD → VIDEO
