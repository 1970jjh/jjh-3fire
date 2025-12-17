// api/generate-image.ts

export const config = {
  runtime: 'edge',
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
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

    // Nano Banana Pro (Gemini 3 Pro Image) - 인포그래픽 전문 모델
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
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
              aspectRatio: '3:4',  // A4 세로형 (보고서용)
              imageSize: '2K'
            }
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error status:', response.status, errorText);

      let errorMessage = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText.substring(0, 200);
        }
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseText = await response.text();

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

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
