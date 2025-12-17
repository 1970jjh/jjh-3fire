// Vercel Serverless Function for Gemini 3 Pro Image API
// This bypasses CORS by calling the API from server-side

export const config = {
  runtime: 'edge',
  // Edge function 최대 실행 시간 설정
  maxDuration: 60,
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

export default async function handler(request: Request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // AbortController로 60초 타임아웃 설정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
    // Gemini 3 Pro Image Preview - 인포그래픽 이미지 생성
    const IMAGE_MODEL = 'gemini-3-pro-image-preview';

    const response = await fetch(
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['Text', 'Image']
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    // 1. response.ok 먼저 확인
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error status:', response.status, errorText);

      // 에러 응답도 JSON인지 확인
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // JSON이 아닌 경우 텍스트 그대로 사용
        if (errorText) {
          errorMessage = errorText.substring(0, 200); // 너무 길면 자르기
        }
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. 응답 텍스트를 먼저 가져오기
    const responseText = await response.text();

    // 3. JSON 파싱을 try-catch로 감싸기
    let data: GeminiResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', responseText.substring(0, 500));
      return new Response(JSON.stringify({
        error: `응답 파싱 실패: ${responseText.substring(0, 100)}...`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. API 에러 응답 확인
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. 이미지 데이터 추출
    let base64Data: string | undefined;
    let mimeType = 'image/png';

    const parts = data.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!base64Data) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      return new Response(JSON.stringify({ error: '이미지 생성 결과가 없습니다. 다시 시도해주세요.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      imageBase64: base64Data,
      mimeType: mimeType
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Server error:', error);

    // AbortError 처리 (타임아웃)
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({
        error: '이미지 생성 시간이 초과되었습니다. 다시 시도해주세요.'
      }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
