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

export interface EndSessionOptions {
  silent?: boolean;
}

// #region agent log
function agentDbg(hypothesisId: string, location: string, message: string, data?: Record<string, unknown>) {
  const payload = {
    sessionId: '9a388a',
    runId: 'post-fix',
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

function enableDeepgramWebSocketLogging() {
  if (typeof window === 'undefined' || (window as any).__dg_ws_instrumented) return;
  const OriginalWebSocket = window.WebSocket;
  (window as any).__dg_ws_instrumented = true;

  window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
    const urlStr = url.toString();
    const isDeepgram = urlStr.includes('deepgram.com');

    if (isDeepgram) {
      const protoList = Array.isArray(protocols) ? protocols : protocols ? [protocols] : [];
      const parsedUrl = parseWsUrl(urlStr);
      console.log(`%c[Deepgram WS] Connecting to: ${urlStr}`, 'color: #38bdf8; font-weight: bold;');
      agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-construct', 'Deepgram WebSocket constructed', {
        host: parsedUrl.host,
        path: parsedUrl.path,
        protoCount: protoList.length,
        protoPrefixes: protoList.map((p) => String(p).slice(0, 12)),
      });
    }

    const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

    if (isDeepgram) {
      ws.addEventListener('open', () => {
        const parsedUrl = parseWsUrl(urlStr);
        console.log(`%c[Deepgram WS] WebSocket OPEN! Subprotocol selected: "${ws.protocol}"`, 'color: #4ade80; font-weight: bold;');
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-open', 'Deepgram WebSocket OPEN', {
          readyState: ws.readyState,
          protocolLen: ws.protocol?.length || 0,
          urlHost: parsedUrl.host,
          path: parsedUrl.path,
          selectedProtocolPrefix: (ws.protocol || '').split(' ')[0] || '(none)',
        });
      });

      ws.addEventListener('message', (event) => {
        try {
          if (typeof event.data === 'string') {
            const parsed = JSON.parse(event.data);
            console.log(`%c[Deepgram WS] Message [${parsed.type || 'unknown'}]:`, 'color: #a78bfa;', parsed);
          }
        } catch {
          // ignore non-JSON
        }
      });

      ws.addEventListener('error', (event) => {
        console.error(`%c[Deepgram WS] WebSocket ERROR event:`, 'color: #f43f5e; font-weight: bold;', event);
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-error', 'Deepgram WebSocket ERROR', {
          readyState: ws.readyState,
          type: (event as any)?.type,
        });
      });

      ws.addEventListener('close', (event) => {
        console.warn(
          `%c[Deepgram WS] WebSocket CLOSED — Code: ${event.code}, Reason: "${event.reason || '(none)'}", WasClean: ${event.wasClean}`,
          'color: #f59e0b; font-weight: bold;'
        );
        agentDbg('B', 'useDeepgramVoiceAgent.ts:ws-close', 'Deepgram WebSocket CLOSED', {
          code: event.code,
          reason: event.reason || '(none)',
          wasClean: event.wasClean,
          readyState: ws.readyState,
        });
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

function defaultAgentSettings(systemPrompt: string) {
  return {
    language: 'en',
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
        model: 'aura-2-thalia-en',
      },
    },
    greeting: 'Hello! I am your AI interviewer today. Whenever you are ready, let me know or introduce yourself.',
  };
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
  const volIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  const sessionIdRef = useRef(sessionId);
  const systemPromptRef = useRef(systemPrompt);
  const agentConfigRef = useRef(agentConfig);
  const onErrorRef = useRef(onError);
  const onTurnCompleteRef = useRef(onTurnComplete);

  sessionIdRef.current = sessionId;
  systemPromptRef.current = systemPrompt;
  agentConfigRef.current = agentConfig;
  onErrorRef.current = onError;
  onTurnCompleteRef.current = onTurnComplete;

  const syncTurnToServer = useCallback(async (turn: SessionTurn) => {
    try {
      await fetch('/api/interview/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turn),
      });
      onTurnCompleteRef.current?.(turn);
    } catch (err) {
      console.error('Failed to sync turn to server:', err);
    }
  }, []);

  const cleanupResources = useCallback(() => {
    if (volIntervalRef.current) {
      clearInterval(volIntervalRef.current);
      volIntervalRef.current = null;
    }
    if (micRef.current) {
      try {
        if (typeof micRef.current.stop === 'function') micRef.current.stop();
      } catch {
        // ignore
      }
      micRef.current = null;
    }
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.dispose === 'function') playerRef.current.dispose();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect();
      } catch {
        // ignore
      }
      sessionRef.current = null;
    }
  }, []);

  const endSession = useCallback(
    (options?: EndSessionOptions) => {
      intentionalCloseRef.current = true;
      runIdRef.current += 1;
      agentDbg('A', 'useDeepgramVoiceAgent.ts:endSession', 'endSession called', {
        silent: !!options?.silent,
        hadSession: !!sessionRef.current,
        hadMic: !!micRef.current,
      });
      cleanupResources();
      setSpeakerState('idle');
      if (!options?.silent) {
        setConnectionState('disconnected');
      }
    },
    [cleanupResources]
  );

  const startSession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    intentionalCloseRef.current = false;
    runIdRef.current += 1;
    const runId = runIdRef.current;
    cleanupResources();
    enableDeepgramWebSocketLogging();

    setConnectionState('connecting');
    setErrorMessage(null);

    const prompt = systemPromptRef.current;
    const config = agentConfigRef.current;

    agentDbg('A', 'useDeepgramVoiceAgent.ts:startSession', 'startSession invoked', {
      runId,
      hasAgentConfig: !!config,
      listenModel: config?.agent?.listen?.provider?.model || 'fallback-nova-3',
      speakModel: config?.agent?.speak?.provider?.model || 'fallback-aura-2-thalia-en',
      promptLen: prompt?.length || 0,
    });

    const stillCurrent = () => runId === runIdRef.current && !intentionalCloseRef.current;

    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        agentDbg('E', 'useDeepgramVoiceAgent.ts:mic-preflight', 'mic preflight succeeded', {
          runId,
          trackCount: stream.getTracks().length,
        });
      } catch (micErr: any) {
        if (!stillCurrent()) return;
        console.error('[Deepgram] Microphone preflight check failed:', micErr);
        agentDbg('E', 'useDeepgramVoiceAgent.ts:mic-preflight', 'mic preflight failed', {
          name: micErr?.name,
          msg: String(micErr?.message || ''),
        });
        const isDenied =
          micErr.name === 'NotAllowedError' ||
          micErr.name === 'PermissionDeniedError' ||
          micErr.message?.toLowerCase().includes('permission');
        const desc = isDenied
          ? 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          : `Microphone device error: ${micErr.message || micErr.name}`;
        setConnectionState('error');
        setErrorMessage(desc);
        onErrorRef.current?.(desc);
        return;
      }

      if (!stillCurrent()) return;

      const { AgentSession, AgentMicrophone, AgentPlayer } = await import('@deepgram/agents');
      if (!stillCurrent()) return;

      const player = new AgentPlayer();
      playerRef.current = player;

      const requestedSpeak = config?.agent?.speak?.provider?.model as string | undefined;
      const speakModel =
        !requestedSpeak || requestedSpeak === 'aura-asteria-en' ? 'aura-2-thalia-en' : requestedSpeak;

      const agentSettings = {
        ...defaultAgentSettings(prompt),
        ...(config?.agent || {}),
        language: config?.agent?.language || 'en',
        think: {
          ...defaultAgentSettings(prompt).think,
          ...(config?.agent?.think || {}),
          prompt: config?.agent?.think?.prompt || prompt,
        },
        speak: {
          provider: {
            type: 'deepgram',
            ...(config?.agent?.speak?.provider || {}),
            model: speakModel,
          },
        },
      };

      const audioConfig = {
        input: {
          encoding: config?.audio?.input?.encoding || 'linear16',
          sampleRate: config?.audio?.input?.sampleRate || config?.audio?.input?.sample_rate || 16000,
        },
        output: {
          encoding: config?.audio?.output?.encoding || 'linear16',
          sampleRate: config?.audio?.output?.sampleRate || config?.audio?.output?.sample_rate || 24000,
        },
      };

      console.log('[Deepgram] Initializing AgentSession with config:', {
        agent: agentSettings,
        audio: audioConfig,
      });

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
            agentDbg('C', 'useDeepgramVoiceAgent.ts:tokenFactory', 'tokenFactory resolved', {
              httpStatus: res.status,
              tokenLen: token.length,
              looksLikeJwt: token.startsWith('eyJ'),
              looksLikeJson: token.startsWith('{'),
            });
            return token;
          },
        },
        agent: agentSettings,
        audio: audioConfig,
      });

      if (!stillCurrent()) {
        try {
          session.disconnect();
        } catch {
          // ignore
        }
        return;
      }

      sessionRef.current = session;

      session.on('connecting', () => {
        if (!stillCurrent()) return;
        console.log('[Deepgram AgentSession] Event: connecting');
        setConnectionState('connecting');
      });

      session.on('connected', () => {
        if (!stillCurrent()) return;
        console.log('[Deepgram AgentSession] Event: connected (handshake complete)');
      });

      session.on('welcome', (msg: any) => {
        console.log('[Deepgram AgentSession] Event: welcome, request_id:', msg?.request_id);
      });

      session.on('settings-applied', (msg: any) => {
        if (!stillCurrent()) return;
        console.log('[Deepgram AgentSession] Event: settings-applied', msg);
        agentDbg('D', 'useDeepgramVoiceAgent.ts:settings-applied', 'settings-applied received', {
          hasMsg: !!msg,
        });
        setConnectionState('connected');
        setSpeakerState('listening');
      });

      session.on('reconnecting', (attempt: number, delayMs: number) => {
        if (!stillCurrent()) return;
        console.warn(`[Deepgram AgentSession] Event: reconnecting (attempt ${attempt}, delay ${delayMs}ms)`);
        setConnectionState('reconnecting');
      });

      session.on('disconnected', (reason: string) => {
        if (intentionalCloseRef.current || !stillCurrent()) return;
        console.warn('[Deepgram AgentSession] Event: disconnected, reason:', reason);
        agentDbg('A', 'useDeepgramVoiceAgent.ts:disconnected', 'AgentSession disconnected', {
          reason: String(reason || ''),
        });
        setConnectionState('disconnected');
        setErrorMessage(`Disconnected from voice session: ${reason}`);
        onErrorRef.current?.(`Disconnected: ${reason}`);
      });

      session.on('sdk-error', (err: any) => {
        if (intentionalCloseRef.current || !stillCurrent()) return;
        console.error('[Deepgram AgentSession] Event: sdk-error:', err);
        agentDbg('D', 'useDeepgramVoiceAgent.ts:sdk-error', 'AgentSession sdk-error', {
          msg: String(err?.message || err),
          name: err?.name,
        });
        setConnectionState('error');
        const desc = err?.message || 'Deepgram SDK connection failure';
        setErrorMessage(desc);
        onErrorRef.current?.(desc);
      });

      session.on('error', (err: any) => {
        if (intentionalCloseRef.current || !stillCurrent()) return;
        console.error('[Deepgram AgentSession] Event: server error:', err);
        agentDbg('D', 'useDeepgramVoiceAgent.ts:server-error', 'AgentSession server error', {
          msg: err?.message || null,
          description: err?.description || null,
          code: err?.code || null,
          type: err?.type || null,
        });
        setConnectionState('error');
        const desc = err?.description || err?.message || JSON.stringify(err);
        setErrorMessage(desc);
        onErrorRef.current?.(desc);
      });

      session.on('warning', (warn: any) => {
        console.warn('[Deepgram AgentSession] Event: warning:', warn);
      });

      session.on('audio', (chunk: ArrayBuffer) => {
        if (!stillCurrent()) return;
        player.queue(chunk);
      });

      session.on('agent-started-speaking', () => {
        if (!stillCurrent()) return;
        setSpeakerState('speaking-agent');
      });

      session.on('agent-thinking', () => {
        if (!stillCurrent()) return;
        setSpeakerState('thinking');
      });

      session.on('agent-audio-done', () => {
        if (!stillCurrent()) return;
        setSpeakerState('listening');

        if (currentUserAnswerRef.current && currentAgentQuestionRef.current) {
          const turn: SessionTurn = {
            session_id: sessionIdRef.current,
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
        if (!stillCurrent()) return;
        setSpeakerState('speaking-user');
        player.interrupt();
      });

      session.on('conversation-text', (msg: any) => {
        if (!stillCurrent()) return;
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

      console.log('[Deepgram] Connecting AgentSession...');
      await session.connect();
      if (!stillCurrent()) return;

      console.log('[Deepgram] Starting AgentMicrophone...');
      const mic = new AgentMicrophone((frame: ArrayBuffer) => {
        session.sendAudio(frame);
      });

      micRef.current = mic;
      await mic.start();
      if (!stillCurrent()) {
        try {
          mic.stop();
        } catch {
          // ignore
        }
        return;
      }
      console.log('[Deepgram] AgentMicrophone active and streaming');

      volIntervalRef.current = setInterval(() => {
        if (mic) {
          const vol = typeof mic.getInputVolume === 'function' ? mic.getInputVolume() : 0;
          setVolumeLevel(vol);
        }
      }, 80);
    } catch (err: any) {
      if (!stillCurrent()) return;
      console.error('Failed to start Deepgram voice session:', err);
      agentDbg('B', 'useDeepgramVoiceAgent.ts:startSession-catch', 'startSession threw', {
        msg: String(err?.message || err),
        name: err?.name,
      });
      const msg = err.message || 'Failed to connect to Deepgram Voice Agent.';
      setConnectionState('error');
      setErrorMessage(msg);
      onErrorRef.current?.(msg);
    }
  }, [cleanupResources, syncTurnToServer]);

  useEffect(() => {
    if (!sessionId || !systemPrompt) return;
    startSession();
    return () => {
      endSession({ silent: true });
    };
  }, [sessionId, systemPrompt, startSession, endSession]);

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
