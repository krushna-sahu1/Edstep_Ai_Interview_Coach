export interface DeepgramTokenResponse {
  key?: string;
  token?: string;
  access_token?: string;
}

export async function generateDeepgramTempToken(): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured in environment variables.');
  }

  try {
    const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time_to_live_in_seconds: 3600, // 1 hour TTL to prevent premature token expiration
      }),
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.key || data.token || data.access_token;
      if (token) return String(token).trim();
    }

    console.warn(`Deepgram auth/grant returned status ${response.status}`);
    const errorText = await response.text();
    console.warn(`Deepgram auth/grant response:`, errorText);

    throw new Error(`Failed to mint temporary Deepgram token (${response.status}): ${errorText || response.statusText}`);
  } catch (error: any) {
    console.error('Deepgram token generation error:', error);
    throw error;
  }
}

export function buildDeepgramAgentConfig(systemPrompt: string) {
  return {
    type: 'Settings' as const,
    audio: {
      input: {
        encoding: 'linear16' as const,
        sampleRate: 16000,
        sample_rate: 16000,
      },
      output: {
        encoding: 'linear16' as const,
        sampleRate: 24000,
        sample_rate: 24000,
      },
    },
    agent: {
      listen: {
        provider: {
          type: 'deepgram' as const,
          model: 'nova-3',
        },
      },
      think: {
        provider: {
          type: 'open_ai' as const,
          model: 'gpt-4o-mini',
        },
        prompt: systemPrompt,
      },
      speak: {
        provider: {
          type: 'deepgram' as const,
          model: 'aura-asteria-en',
        },
      },
      greeting: 'Hello! I am your AI interviewer today. Whenever you are ready, let me know or introduce yourself.',
    },
  };
}
