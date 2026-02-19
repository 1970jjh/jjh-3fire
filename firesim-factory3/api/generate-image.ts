// Vercel Serverless Function (Node.js) - Gemini 3 Pro Image Preview API
// Node.js runtime allows longer execution time (up to 300s on Pro plan)

export const config = {
  maxDuration: 120, // 120초 타임아웃 (Pro plan)
};

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// 지연 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // 재시도 로직 (최대 3회)
    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Gemini API 호출 시도 ${attempt}/${maxRetries}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
              }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        // 서버 과부하 에러 (503, 429) - 재시도
        if (response.status === 503 || response.status === 429) {
          const errorText = await response.text();
          console.log(`서버 과부하 (${response.status}): ${errorText.substring(0, 100)}`);
          lastError = '서버가 바쁩니다. 잠시 후 다시 시도해주세요.';

          if (attempt < maxRetries) {
            console.log(`${attempt * 3}초 후 재시도...`);
            await delay(attempt * 3000); // 3초, 6초, 9초 대기
            continue;
          }
          return res.status(503).json({ error: lastError });
        }

        // 다른 에러
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API error:', response.status, errorText);

          let errorMessage = `API error: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message;
            }
          } catch {
            // ignore
          }

          return res.status(response.status).json({ error: errorMessage });
        }

        // 성공 응답 파싱
        const data: GeminiResponse = await response.json();

        if (data.error) {
          return res.status(400).json({ error: data.error.message });
        }

        // 이미지 데이터 추출
        const parts = data.candidates?.[0]?.content?.parts;
        let imageData = null;

        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              imageData = {
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
              };
              break;
            }
          }
        }

        if (!imageData) {
          console.error('No image in response:', JSON.stringify(data).substring(0, 500));
          return res.status(500).json({ error: '이미지 생성 결과가 없습니다.' });
        }

        // 성공!
        console.log('이미지 생성 성공!');
        return res.status(200).json({
          success: true,
          imageBase64: imageData.base64,
          mimeType: imageData.mimeType
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({ error: '이미지 생성 시간이 초과되었습니다.' });
        }

        console.error(`시도 ${attempt} 실패:`, fetchError.message);
        lastError = fetchError.message;

        if (attempt < maxRetries) {
          await delay(attempt * 3000);
          continue;
        }
      }
    }

    // 모든 재시도 실패
    return res.status(503).json({ error: lastError || '서버가 바쁩니다. 잠시 후 다시 시도해주세요.' });

  } catch (error: any) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: error.message || '알 수 없는 오류'
    });
  }
}
