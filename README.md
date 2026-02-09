# 🚀 SpaceWalk AI Studio

Gemini NanoBanana Pro API를 사용한 AI 얼굴 합성 웹 애플리케이션

## 📋 프로젝트 개요

SpaceWalk AI Studio는 Google의 Gemini NanoBanana Pro 모델을 활용하여 두 이미지를 합성하는 웹 애플리케이션입니다. 사용자의 얼굴을 다른 배경 이미지에 자연스럽게 합성할 수 있습니다.

### 주요 기능

- 📸 **웹캠 촬영**: 실시간으로 얼굴 사진 촬영
- 📁 **파일 업로드**: 이미지 및 영상 파일 지원 (영상은 1초 시점 프레임 추출)
- 🤖 **AI 얼굴 합성**: Gemini NanoBanana Pro를 사용한 고품질 합성
- 💾 **결과물 다운로드**: 합성된 이미지 저장
- 🎨 **반응형 UI**: 모바일/데스크톱 지원

## 🛠 기술 스택

### Frontend
- HTML5 (Canvas API, Video API)
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Gemini API (NanoBanana Pro)

### 배포
- Vercel (Serverless Functions)

## 📁 프로젝트 구조

```
원앙/
├── api/
│   └── faceswap.js          # Vercel 서버리스 함수 (Gemini API 호출)
├── public/
│   └── index.html           # 프론트엔드 메인 페이지
├── server_gemini.js         # 로컬 개발용 Node.js 서버
├── package.json             # 프로젝트 설정 및 의존성
├── vercel.json              # Vercel 배포 설정
└── .gitignore               # Git 제외 파일 목록
```

## 🚀 로컬 개발 환경 설정

### 1. 필수 요구사항

- Node.js 14.x 이상
- npm 또는 yarn
- Google AI Studio API 키

### 2. API 키 발급

1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사 (AIzaSy... 로 시작)

### 3. 설치 및 실행

```bash
# 프로젝트 폴더로 이동
cd "c:\Users\tldnm\Documents\원앙"

# 의존성 설치 (필요시)
npm install

# 로컬 서버 실행
node server_gemini.js
```

서버가 실행되면 http://localhost:3000 에서 접속 가능합니다.

### 4. 사용 방법

1. **인물 사진 업로드**: 얼굴이 포함된 사진 업로드 또는 웹캠 촬영
2. **광고 배경 업로드**: 얼굴을 합성할 배경 이미지/영상 업로드
3. **API 키 입력**: Google AI Studio에서 발급받은 API 키 입력
4. **합성 시작**: 버튼 클릭 후 10-20초 대기
5. **결과 다운로드**: 합성된 이미지 다운로드

## 🌐 배포 방법

### Vercel 배포 (추천)

#### 방법 1: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

#### 방법 2: GitHub + Vercel

1. **GitHub 저장소 생성**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/spacewalk-ai-studio.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel에서 배포**
   - https://vercel.com 접속 및 로그인
   - "Add New Project" 클릭
   - GitHub 저장소 연결 및 배포

## 🔧 주요 코드 설명

### 1. 얼굴 합성 API (`api/faceswap.js`)

Vercel 서버리스 함수로 구현된 백엔드 API입니다.

```javascript
export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Gemini API 호출
    const response = await fetch(GEMINI_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    // 이미지 데이터 추출 및 반환
    return res.json({ success: true, image: imageData });
}
```

### 2. 프롬프트 엔지니어링

Gemini API에 전달되는 프롬프트:

```
Use the SECOND uploaded image (or frame) as the base and final output.

Do not generate a new scene and do not blend or merge the two images.

Keep the base image exactly the same in background, body, pose, clothing, framing, and lighting.

Use the FIRST uploaded image only as a facial reference.

Recreate the face of the person in the base image so that it closely resembles the facial features of the person in the reference image.

Blend the adjusted face naturally to match skin tone, lighting, angle, and perspective.

Keep the result subtle, realistic, and consistent.
```

### 3. 영상 프레임 추출

영상 파일에서 1초 시점의 프레임을 추출합니다:

```javascript
video.onloadeddata = function() {
    video.currentTime = 1;  // 1초 시점으로 이동
};

video.onseeked = function() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    adImage = canvas.toDataURL('image/jpeg', 0.9);
};
```

### 4. 웹캠 촬영

getUserMedia API를 사용한 웹캠 촬영:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 } }
});
video.srcObject = stream;
```

## ⚙️ 설정 커스터마이징

### 포트 변경 (로컬 서버)

`server_gemini.js` 파일에서:

```javascript
const PORT = 3000;  // 원하는 포트 번호로 변경
```

### 프롬프트 수정

더 나은 결과를 위해 프롬프트를 수정할 수 있습니다:

- `api/faceswap.js` (배포용)
- `server_gemini.js` (로컬 개발용)

54-55번째 줄의 `text` 부분을 수정하세요.

### API 모델 변경

다른 Gemini 모델을 사용하려면:

```javascript
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent';
```

## 🐛 문제 해결

### 1. "finishReason: OTHER" 오류

**원인**: Gemini API가 이미지 생성을 거부했습니다.

**해결**:
- 다른 이미지로 시도
- API 키 확인
- 프롬프트 수정

### 2. CORS 오류

**원인**: 로컬 개발 시 CORS 정책 문제

**해결**:
- `server_gemini.js`에서 CORS 헤더 확인
- Vercel 배포 시에는 자동 해결됨

### 3. 웹캠이 작동하지 않음

**원인**: 브라우저 권한 문제

**해결**:
- HTTPS 환경에서 실행 (로컬은 localhost 허용)
- 브라우저 설정에서 카메라 권한 확인

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issue를 생성해주세요.

---

**⚠️ 중요 사항**

- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일을 사용할 경우 `.gitignore`에 추가하세요
- 프로덕션 환경에서는 API 키를 환경 변수로 관리하세요
- Gemini API 무료 티어 제한을 확인하세요

---

Made with ❤️ using Gemini NanoBanana Pro
