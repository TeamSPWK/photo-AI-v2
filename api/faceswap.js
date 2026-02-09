export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONS 요청 (CORS preflight) 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청: 얼굴 합성
    if (req.method === 'POST') {
        try {
            const { apiKey, personImage, adImage } = req.body;

            console.log('🎭 Gemini 얼굴 합성 시작...');

            // Base64에서 data:image/... 헤더 제거
            const personImageData = personImage.split(',')[1];
            const adImageData = adImage.split(',')[1];

            // Gemini API 요청 구성
            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: personImageData
                                }
                            },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: adImageData
                                }
                            },
                            {
                                text: "Use the SECOND uploaded image (or frame) as the base and final output.\n\nDo not generate a new scene and do not blend or merge the two images.\n\nKeep the base image exactly the same in background, body, pose, clothing, framing, and lighting.\n\nUse the FIRST uploaded image only as a facial reference.\n\nRecreate the face of the person in the base image so that it closely resembles the facial features of the person in the reference image.\n\nBlend the adjusted face naturally to match skin tone, lighting, angle, and perspective.\n\nKeep the result subtle, realistic, and consistent."
                            }
                        ]
                    }
                ],
                generationConfig: {
                    response_modalities: ["IMAGE", "TEXT"],
                    temperature: 0.7
                }
            };

            console.log('📤 Gemini API 호출 중...');

            // Gemini API 호출
            const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent';
            const apiUrl = `${GEMINI_API_ENDPOINT}?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API 오류:', errorText);
                throw new Error(`Gemini API 오류: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ 응답 받음');
            console.log('응답 구조:', JSON.stringify(result, null, 2).substring(0, 500));

            // 이미지 추출
            let imageData = null;

            // finishReason 체크
            if (result.candidates && result.candidates[0]) {
                const finishReason = result.candidates[0].finishReason;
                console.log(`Finish Reason: ${finishReason}`);

                if (finishReason === 'OTHER' || finishReason === 'SAFETY') {
                    console.error('❌ 모델이 작업을 거부했습니다.');
                    console.error('전체 응답:', JSON.stringify(result, null, 2));
                    throw new Error(`나노바나나가 이미지 생성을 거부했습니다. Reason: ${finishReason}\n\n이 모델은 얼굴 합성(face swap)을 지원하지 않을 수 있습니다.`);
                }
            }

            if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                const parts = result.candidates[0].content.parts;

                if (!parts || parts.length === 0) {
                    console.error('❌ content.parts가 비어있습니다.');
                    throw new Error('응답에 parts가 없습니다');
                }

                console.log(`Parts 수: ${parts.length}`);

                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    console.log(`Part ${i}:`, Object.keys(part));

                    if (part.inline_data && part.inline_data.data) {
                        imageData = part.inline_data.data;
                        console.log(`✅ Part ${i}에서 이미지 발견! 크기: ${imageData.length} bytes`);
                        break;
                    } else if (part.inlineData && part.inlineData.data) {
                        // camelCase 시도
                        imageData = part.inlineData.data;
                        console.log(`✅ Part ${i}에서 이미지 발견! (camelCase) 크기: ${imageData.length} bytes`);
                        break;
                    }
                }
            }

            if (!imageData) {
                console.error('❌ 이미지를 찾을 수 없음. 전체 응답:', JSON.stringify(result, null, 2));
                throw new Error('응답에 이미지가 없습니다');
            }

            console.log('✅ 얼굴 합성 완료!');

            res.status(200).json({
                success: true,
                image: `data:image/jpeg;base64,${imageData}`
            });

        } catch (error) {
            console.error('❌ Error:', error.message);
            res.status(500).json({
                error: error.message
            });
        }
    } else {
        res.status(404).end('Not Found');
    }
}
