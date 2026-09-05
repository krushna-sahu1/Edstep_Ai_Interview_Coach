'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionTurn } from '@/types/interview';

export type AgentSpeakerState = 'idle' | 'listening' | 'thinking' | 'speaking-agent' | 'speaking-user';
export type AgentConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface TranscriptItem {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface UseDeepgramVoiceAgentOptions {
  sessionId: string;
  systemPrompt: string;
  agentConfig?: any;
  onTurnComplete?: (turn: SessionTurn) => void;
  onError?: (error: string) => void;
}

// #region agent log
function agentDbg(hypothesisId: string, location: string, message: string, data?: Record<string, unknown>) {
  const payload = {
    sessionId: '9a388a',
    runId: 'pre-fix',
    hypothesisId,
    location,
    message,
    data: data || {},
    timestamp: Date.now(),
  };
    fetch('/api/agent-debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9a388a' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

function parseWsUrl(urlStr: string) {
  try {
    const parsed = new URL(urlStr);
    return { host: parsed.host, path: parsed.pathname };
  } catch {
    return { host: 'bad-url', path: '' };
  }
}

// Global WebSocket logging interceptor for Deepgram telemetry
function enableDeepgramWebSocketLogging() {
  if (typeof window === 'undefined' || (window as any).__dg_ws_instrumented) return;
  const OriginalWebSocket = window.WebSocket;
  (window as any).__dg_ws_instrumented = true;

  window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
    const urlStr = url.toString();
    const isDeepgram = urlStr.includes('deepgram.com');

    if (isDeepgram) {
      console.log(`%c[Deepgram WS] Connecting to: ${urlStr}`, 'color: #38bdf8; font-weight: bold;');
      const protoList = Array.isArray(protocols) ? protocols : protocols ? [protocols] : [];
      const safeProtoList = protoList.map((p) => (p.length > 30 ? `${p.slice(0, 15)}...${p.slice(-6)}` : p));
      console.log(`%c[Deepgram WS] Subprotocols:`, 'color: #94a3b8;', safeProtoList);
      // #region agent log
      const parsedUrl = parseWsUrl(urlStr);
      agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-construct', 'Deepgram WebSocket constructed', {
        host: parsedUrl.host,
        path: parsedUrl.path,
        protoCount: protoList.length,
        protoPrefixes: protoList.map((p) => String(p).split(/[\s,]/)[0]).slice(0, 4),
      });
      // #endregion
    }

    const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

    if (isDeepgram) {
      ws.addEventListener('open', (event) => {
        console.log(`%c[Deepgram WS] WebSocket OPEN! Subprotocol selected: "${ws.protocol}"`, 'color: #4ade80; font-weight: bold;', event);
        // #region agent log
        const parsedUrl = parseWsUrl(urlStr);
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-open', 'Deepgram WebSocket OPEN', {
          readyState: ws.readyState,
          protocolLen: ws.protocol?.length || 0,
          urlHost: parsedUrl.host,
          path: parsedUrl.path,
          selectedProtocolPrefix: (ws.protocol || '').split(' ')[0] || '(none)',
        });
        // #endregion
      });

      ws.addEventListener('message', (event) => {
        try {
          if (typeof event.data === 'string') {
            const parsed = JSON.parse(event.data);
            console.log(`%c[Deepgram WS] Message [${parsed.type || 'unknown'}]:`, 'color: #a78bfa;', parsed);
          } else {
            console.log(`%c[Deepgram WS] Binary frame received (${(event.data as any)?.byteLength || (event.data as any)?.size || 'unknown'} bytes)`, 'color: #64748b;');
          }
        } catch {
          console.log(`%c[Deepgram WS] Message:`, 'color: #a78bfa;', event.data);
        }
      });

      ws.addEventListener('error', (event) => {
        console.error(`%c[Deepgram WS] WebSocket ERROR event:`, 'color: #f43f5e; font-weight: bold;', event);
        // #region agent log
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-error', 'Deepgram WebSocket ERROR', {
          readyState: ws.readyState,
          type: (event as any)?.type,
        });
        // #endregion
      });

      ws.addEventListener('close', (event) => {
        console.warn(
          `%c[Deepgram WS] WebSocket CLOSED — Code: ${event.code}, Reason: "${event.reason || '(none)'}", WasClean: ${event.wasClean}`,
          'color: #f59e0b; font-weight: bold;'
        );
        // #region agent log
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-close', 'Deepgram WebSocket CLOSED', {
          code: event.code,
          reason: event.reason || '(none)',
          wasClean: event.wasClean,
          readyState: ws.readyState,
        });
        // #endregion
      });
    }

    return ws;
  } as any;

  const WS = window.WebSocket as any;
  WS.prototype = OriginalWebSocket.prototype;
  WS.CONNECTING = OriginalWebSocket.CONNECTING;
  WS.OPEN = OriginalWebSocket.OPEN;
  WS.CLOSING = OriginalWebSocket.CLOSING;
  WS.CLOSED = OriginalWebSocket.CLOSED;
}

export function useDeepgramVoiceAgent({
  sessionId,
  systemPrompt,
  agentConfig,
  onTurnComplete,
  onError,
}: UseDeepgramVoiceAgentOptions) {
  const [connectionState, setConnectionState] = useState<AgentConnectionState>('idle');
  const [speakerState, setSpeakerState] = useState<AgentSpeakerState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const micRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const turnIndexRef = useRef(0);
  const currentAgentQuestionRef = useRef('');
  const currentUserAnswerRef = useRef('');
  const volIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncTurnToServer = useCallback(
    async (turn: SessionTurn) => {
      try {
        await fetch('/api/interview/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(turn),
        });
        if (onTurnComplete) onTurnComplete(turn);
      } catch (err) {
        console.error('Failed to sync turn to server:', err);
      }
    },
    [onTurnComplete]
  );

  const startSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    enableDeepgramWebSocketLogging();

    setConnectionState('connecting');
    setErrorMessage(null);
    // #region agent log
    agentDbg('A', 'useDeepgramVoiceAgent.ts:startSession', 'startSession invoked', {
      hasAgentConfig: !!agentConfig,
      listenModel: agentConfig?.agent?.listen?.provider?.model || 'fallback-nova-3',
      speakModel: agentConfig?.agent?.speak?.provider?.model || 'fallback-aura-asteria-en',
      promptLen: systemPrompt?.length || 0,
    });
    // #endregion

    try {
      // 1. Microphone Preflight Check to ensure user permission is resolved before connecting
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release preflight tracks so AgentMicrophone can open cleanly
        stream.getTracks().forEach((track) => track.stop());
        // #region agent log
        agentDbg('E', 'useDeepgramVoiceAgent.ts:mic-preflight', 'mic preflight succeeded', {
          trackCount: stream.getTracks().length,
        });
        // #endregion
      } catch (micErr: any) {
        console.error('[Deepgram] Microphone preflight check failed:', micErr);
        // #region agent log
        agentDbg('E', 'useDeepgramVoiceAgent.ts:mic-preflight', 'mic preflight failed', {
          name: micErr?.name,
          msg: String(micErr?.message || ''),
        });
        // #endregion
        const isDenied =
          micErr.name === 'NotAllowedError' ||
          micErr.name === 'PermissionDeniedError' ||
          micErr.message?.toLowerCase().includes('permission');
        const desc = isDenied
          ? 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          : `Microphone device error: ${micErr.message || micErr.name}`;
        setConnectionState('error');
        setErrorMessage(desc);
        if (onError) onError(desc);
        return;
      }

      // 2. Dynamic import to avoid SSR errors
      const { AgentSession, AgentMicrophone, AgentPlayer } = await import('@deepgram/agents');

      // 3. Initialize Player for TTS output
      const player = new AgentPlayer();
      playerRef.current = player;

      // 4. Resolve agent and audio settings
      const agentSettings = agentConfig?.agent || {
        listen: {
          provider: {
            type: 'deepgram',
            model: 'nova-3',
          },
        },
        think: {
          provider: {
            type: 'open_ai',
            model: 'gpt-4o-mini',
          },
          prompt: systemPrompt,
        },
        speak: {
          provider: {
            type: 'deepgram',
            model: 'aura-asteria-en',
          },
        },
        greeting: 'Hello! I am your AI interviewer today. Whenever you are ready, let me know or introduce yourself.',
      };

      const audioConfig = agentConfig?.audio || {
        input: {
          encoding: 'linear16',
          sampleRate: 16000,
        },
        output: {
          encoding: 'linear16',
          sampleRate: 24000,
        },
      };

      console.log('[Deepgram] Initializing AgentSession with config:', {
        agent: agentSettings,
        audio: audioConfig,
      });

      // 5. Initialize Voice Agent Session with tokenFactory
      const session = new AgentSession({
        auth: {
          tokenFactory: async () => {
            console.log('[Deepgram] Fetching fresh token from /api/deepgram-token...');
            const res = await fetch('/api/deepgram-token', { cache: 'no-store' });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Token endpoint failed (${res.status}): ${errBody}`);
            }
            const token = (await res.text()).trim();
            if (!token) throw new Error('Token endpoint returned empty response');
            console.log('[Deepgram] Bearer token acquired successfully');
            // #region agent log
            agentDbg('C', 'useDeepgramVoiceAgent.ts:tokenFactory', 'tokenFactory resolved', {
              httpStatus: res.status,
              tokenLen: token.length,
              looksLikeJwt: token.startsWith('eyJ'),
              looksLikeJson: token.startsWith('{'),
            });
            // #endregion
            return token;
          },
        },
        agent: agentSettings,
        audio: audioConfig,
      });

      sessionRef.current = session;

      // 6. Setup full session event listeners
      session.on('connecting', () => {
        console.log('[Deepgram AgentSession] Event: connecting');
        setConnectionState('connecting');
      });

      session.on('connected', () => {
        console.log('[Deepgram AgentSession] Event: connected (handshake complete)');
      });

      session.on('welcome', (msg: any) => {
        console.log('[Deepgram AgentSession] Event: welcome, request_id:', msg?.request_id);
      });

      session.on('settings-applied', (msg: any) => {
        console.log('[Deepgram AgentSession] Event: settings-applied', msg);
        // #region agent log
        agentDbg('D', 'useDeepgramVoiceAgent.ts:settings-applied', 'settings-applied received', {
          hasMsg: !!msg,
        });
        // #endregion
        setConnectionState('connected');
        setSpeakerState('listening');
      });

      session.on('reconnecting', (attempt: number, delayMs: number) => {
        console.warn(`[Deepgram AgentSession] Event: reconnecting (attempt ${attempt}, delay ${delayMs}ms)`);
        setConnectionState('reconnecting');
      });

      session.on('disconnected', (reason: string) => {
        console.warn('[Deepgram AgentSession] Event: disconnected, reason:', reason);
        // #region agent log
        agentDbg('A', 'useDeepgramVoiceAgent.ts:disconnected', 'AgentSession disconnected', {
          reason: String(reason || ''),
        });
        // #endregion
        setConnectionState('disconnected');
        setErrorMessage(`Disconnected from voice session: ${reason}`);
        if (onError) onError(`Disconnected: ${reason}`);
      });

      session.on('sdk-error', (err: any) => {
        console.error('[Deepgram AgentSession] Event: sdk-error:', err);
        // #region agent log
        agentDbg('D', 'useDeepgramVoiceAgent.ts:sdk-error', 'AgentSession sdk-error', {
          msg: String(err?.message || err),
          name: err?.name,
        });
        // #endregion
        setConnectionState('error');
        const desc = err?.message || 'Deepgram SDK connection failure';
        setErrorMessage(desc);
        if (onError) onError(desc);
      });

      session.on('error', (err: any) => {
        console.error('[Deepgram AgentSession] Event: server error:', err);
        // #region agent log
        agentDbg('D', 'useDeepgramVoiceAgent.ts:server-error', 'AgentSession server error', {
          msg: err?.message || null,
          description: err?.description || null,
          code: err?.code || null,
          type: err?.type || null,
          rawType: typeof err,
          rawKeys: err && typeof err === 'object' ? Object.keys(err).slice(0, 12) : [],
        });
        // #endregion
        setConnectionState('error');
        const desc = err?.message || JSON.stringify(err);
        setErrorMessage(desc);
        if (onError) onError(desc);
      });

      session.on('warning', (warn: any) => {
        console.warn('[Deepgram AgentSession] Event: warning:', warn);
      });

      session.on('audio', (chunk: ArrayBuffer) => {
        player.queue(chunk);
      });

      session.on('agent-started-speaking', () => {
        setSpeakerState('speaking-agent');
      });

      session.on('agent-thinking', () => {
        setSpeakerState('thinking');
      });

      session.on('agent-audio-done', () => {
        setSpeakerState('listening');

        // If candidate provided an answer and agent finished speaking, log turn
        if (currentUserAnswerRef.current && currentAgentQuestionRef.current) {
          const turn: SessionTurn = {
            session_id: sessionId,
            turn_index: turnIndexRef.current++,
            speaker: 'agent',
            question_text: currentAgentQuestionRef.current,
            answer_transcript: currentUserAnswerRef.current,
            timestamp: new Date().toISOString(),
          };
          syncTurnToServer(turn);
          currentUserAnswerRef.current = '';
        }
      });

      session.on('user-started-speaking', () => {
        setSpeakerState('speaking-user');
        // Instantly interrupt agent playback when user speaks
        if (player) {
          player.interrupt();
        }
      });

      session.on('conversation-text', (msg: any) => {
        const role = msg.role || (msg.speaker === 'assistant' ? 'agent' : 'user');
        const text = msg.content || msg.text || '';
        if (!text.trim()) return;

        const newItem: TranscriptItem = {
          id: Math.random().toString(36).substring(2, 9),
          speaker: role === 'assistant' || role === 'agent' ? 'agent' : 'user',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setTranscripts((prev) => [...prev, newItem]);

        if (newItem.speaker === 'agent') {
          currentAgentQuestionRef.current = text;
        } else {
          currentUserAnswerRef.current = (currentUserAnswerRef.current + ' ' + text).trim();
        }
      });

      // 7. Connect session first
      console.log('[Deepgram] Connecting AgentSession...');
      await session.connect();

      // 8. Initialize Microphone and start streaming frames
      console.log('[Deepgram] Starting AgentMicrophone...');
      const mic = new AgentMicrophone((frame: ArrayBuffer) => {
        session.sendAudio(frame);
      });

      micRef.current = mic;
      await mic.start();
      console.log('[Deepgram] AgentMicrophone active and streaming');

      // 9. Monitor volume levels for reactive orb animations
      volIntervalRef.current = setInterval(() => {
        if (mic) {
          const vol = typeof mic.getInputVolume === 'function' ? mic.getInputVolume() : 0;
          setVolumeLevel(vol);
        }
      }, 80);
    } catch (err: any) {
      console.error('Failed to start Deepgram voice session:', err);
      // #region agent log
      agentDbg('B', 'useDeepgramVoiceAgent.ts:startSession-catch', 'startSession threw', {
        msg: String(err?.message || err),
        name: err?.name,
      });
      // #endregion
      const msg = err.message || 'Failed to connect to Deepgram Voice Agent.';
      setConnectionState('error');
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  }, [sessionId, systemPrompt, agentConfig, syncTurnToServer, onError]);

  const toggleMute = useCallback(() => {
    if (micRef.current) {
      if (isMuted) {
        if (typeof micRef.current.unmute === 'function') micRef.current.unmute();
        setIsMuted(false);
      } else {
        if (typeof micRef.current.mute === 'function') micRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  const endSession = useCallback(() => {
    // #region agent log
    agentDbg('A', 'useDeepgramVoiceAgent.ts:endSession', 'endSession called', {
      hadSession: !!sessionRef.current,
      hadMic: !!micRef.current,
    });
    // #endregion
    if (volIntervalRef.current) {
      clearInterval(volIntervalRef.current);
      volIntervalRef.current = null;
    }
    if (micRef.current) {
      try {
        if (typeof micRef.current.stop === 'function') micRef.current.stop();
      } catch (e) {
        // ignore
      }
      micRef.current = null;
    }
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.dispose === 'function') playerRef.current.dispose();
      } catch (e) {
        // ignore
      }
      playerRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sessionRef.current = null;
    }
    setConnectionState('disconnected');
    setSpeakerState('idle');
  }, []);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    connectionState,
    speakerState,
    isMuted,
    volumeLevel,
    transcripts,
    errorMessage,
    startSession,
    toggleMute,
    endSession,
  };
}
