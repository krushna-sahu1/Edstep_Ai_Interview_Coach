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
  onTurnComplete?: (turn: SessionTurn) => void;
  onError?: (error: string) => void;
}

export function useDeepgramVoiceAgent({
  sessionId,
  systemPrompt,
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
    setConnectionState('connecting');
    setErrorMessage(null);

    try {
      // Dynamic import to avoid SSR errors
      const { AgentSession, AgentMicrophone, AgentPlayer } = await import('@deepgram/agents');

      // 1. Initialize Player for TTS output
      const player = new AgentPlayer();
      playerRef.current = player;

      // 2. Initialize Voice Agent Session with tokenFactory
      const session = new AgentSession({
        auth: {
          tokenFactory: async () => {
            const res = await fetch('/api/deepgram-token', { cache: 'no-store' });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Token endpoint failed (${res.status}): ${errBody}`);
            }
            return await res.text();
          },
        },
        agent: {
          listen: {
            provider: {
              type: 'deepgram',
              version: 'v1',
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
        },
        audio: {
          input: {
            encoding: 'linear16',
            sampleRate: 16000,
          },
          output: {
            encoding: 'linear16',
            sampleRate: 24000,
          },
        },
      });

      sessionRef.current = session;

      // 3. Setup session event listeners
      session.on('connecting', () => {
        setConnectionState('connecting');
      });

      session.on('settings-applied', () => {
        setConnectionState('connected');
        setSpeakerState('listening');
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

        // If candidate provided an answer and agent finished following up, log turn
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

      session.on('error', (err: any) => {
        console.error('Deepgram AgentSession error:', err);
        const desc = err.message || JSON.stringify(err);
        setErrorMessage(desc);
        if (onError) onError(desc);
      });

      // 4. Initialize Microphone, start capture, and stream frames
      const mic = new AgentMicrophone((frame: ArrayBuffer) => {
        session.sendAudio(frame);
      });

      micRef.current = mic;
      await mic.start();
      await session.connect();

      // Monitor volume levels for reactive orb animations
      volIntervalRef.current = setInterval(() => {
        if (mic) {
          const vol = typeof mic.getInputVolume === 'function' ? mic.getInputVolume() : 0;
          setVolumeLevel(vol);
        }
      }, 80);
    } catch (err: any) {
      console.error('Failed to start Deepgram voice session:', err);
      const msg = err.message || 'Failed to connect to Deepgram Voice Agent.';
      setConnectionState('error');
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  }, [sessionId, systemPrompt, syncTurnToServer, onError]);

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
