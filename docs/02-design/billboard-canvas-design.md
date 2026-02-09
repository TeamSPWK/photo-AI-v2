# PDCA Design: The Billboard Canvas

## 1. API Specifications

### 1.1 POST /api/analyze-templates
**Input**: None (reads from /public/images/)
**Process**: Send each image to Gemini with analysis prompt
**Output**:
```json
{
  "templates": [
    {
      "filename": "001.jpg",
      "personCount": 1,
      "mood": "luxury, elegant",
      "colors": "warm orange, brown",
      "aspectRatio": "16:9",
      "description": "Woman with horse in urban luxury setting"
    }
  ]
}
```

### 1.2 POST /api/analyze-user
**Input**: `{ "userImage": "data:image/jpeg;base64,..." }`
**Process**: Gemini vision analyzes appearance, clothing, mood
**Output**:
```json
{
  "analysis": {
    "description": "지적인 40대 남성분이시네요...",
    "mood": "intellectual",
    "dominantColor": "green",
    "suggestedTemplates": ["005.jpg", "007.jpg"]
  }
}
```
**Gemini Prompt**:
```
You are a charming billboard advertising AI. Analyze this person's photo.
Return JSON with:
- wittyComment: An elegant, witty Korean compliment about their appearance (2-3 sentences)
- mood: one-word mood descriptor
- dominantColor: their outfit's dominant color
- personCount: 1 (it's always 1 user)
- suggestedMoods: array of moods that would complement this person
Be charming and sophisticated like a luxury brand concierge.
```

### 1.3 POST /api/faceswap
**Input**:
```json
{
  "userImage": "data:image/jpeg;base64,...",
  "templateImage": "001.jpg",
  "userAnalysis": { "mood": "...", "wittyComment": "..." }
}
```
**Process**: Nanobanana Pro face swap
**Output**:
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,...",
  "billboardMessage": "당신의 우아한 매력이 명품 광고와 만났습니다."
}
```

### 1.4 POST /api/generate-video
**Input**: `{ "image": "data:image/jpeg;base64,...", "prompt": "cinematic slow motion..." }`
**Process**: Send to RunwayML Gen-3 image-to-video
**Output**:
```json
{
  "taskId": "runway-task-xxx",
  "status": "RUNNING"
}
```

### 1.5 GET /api/video-status/[taskId]
**Output**:
```json
{
  "status": "SUCCEEDED",
  "videoUrl": "https://..."
}
```

## 2. Component Specifications

### 2.1 Page Flow State Machine
```
INIT → INTRO → CAMERA → ANALYZING → FACESWAP → VIDEO_PENDING → VIDEO_READY
```

### 2.2 IntroScreen
- Full-screen black background
- Large headline: "The Billboard Canvas"
- Subtitle: "Step into the spotlight. Become the ad."
- Pulsing "Take a Shot" button (white border, glass effect)
- Subtle particle animation in background

### 2.3 CameraCapture
- Full-screen camera viewfinder with rounded corners
- Countdown timer (3, 2, 1) before capture
- Flash effect on capture
- Circular capture button at bottom

### 2.4 AnalysisScreen
- Black screen with typing animation for witty comment
- Elegant serif font for the compliment
- Subtle glow/aura effect around text
- Auto-advance after 4 seconds

### 2.5 BillboardResult
- Billboard image displayed at 16:9 in center
- Witty message below with fade-in
- Subtle "Generating your billboard video..." indicator
- Shimmer animation on the image

### 2.6 VideoPlayer
- Smooth crossfade from still image to video
- Full-width 16:9 video player
- Auto-play, loop enabled
- "Your Billboard is Live" text above

### 2.7 LoadingOverlay
- Full-screen glass morphism overlay
- Animated ring/pulse
- Rotating witty messages:
  - "당신의 아우라를 분석 중입니다..."
  - "최고의 광고 배경을 선정하고 있습니다..."
  - "전광판에 올릴 걸작을 만들고 있습니다..."

## 3. Environment Variables
```
GEMINI_API_KEY=           # For Gemini Flash + Nanobanana
RUNWAYML_API_SECRET=      # For video generation
```
