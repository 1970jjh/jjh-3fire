// Vercel Serverless Function for Gemini 3 Pro Image API
// This bypasses CORS by calling the API from server-side

export const config = {
  runtime: 'edge',
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

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
    // Gemini 2.0 Flash Experimental - 네이티브 이미지 생성 지원
    const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

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
            responseModalities: ['IMAGE'],
            responseMimeType: 'image/png'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          return new Response(JSON.stringify({ error: errorJson.error.message }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        // JSON parsing failed
      }

      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract image data from Gemini response
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
      return new Response(JSON.stringify({ error: 'No image in response' }), {
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
    console.error('Server error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
