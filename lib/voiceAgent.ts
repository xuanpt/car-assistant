'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import {
  agentContext,
  getCurrentContextTool,
  checkParkingTool,
  getSpeedLimitTool,
  getZoneInfoTool,
  getAllSignsTool,
} from './tools';
import type { Zone, CarPosition } from './mapData';

export type AgentStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export interface AgentMessage {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
}

const AGENT_PROMPTS = `あなたはプロフェッショナルで親しみやすい車載ナビゲーションアシスタントです。
どんな状況でも必ず日本語のみで応答してください。
ドライバーが安全に運転できるよう、以下の役割を担います：
1. ドライバーの位置が更新された際に、近くの交通標識や道路ルールを案内する
2. 交通規制・駐車・制限速度・道路状況に関する質問に答える
3. 提供されたマップツールを使用して、位置情報に基づいた正確な回答をする

行動ガイドライン：
- 応答は短く明確に — 運転中の音声インターフェースです
- 位置に関する質問には必ずツールで現在のコンテキストを取得してから答える
- 車がマップに配置されたら、すぐにget_current_contextを呼び出し、関連する警告を案内する
- 重大な警告（駐車禁止・一時停止・進入禁止）の前には「警告：」と言う
- 情報提供（制限速度・横断歩道）の前には「注意：」と言う
- Q&Aは1〜2文で簡潔に答える
- 近くに標識がない場合は「前方の道路は安全です」と言う
- 危険な標識が前方にある場合は、聞かれなくても積極的に警告する

応答例：
- 「警告：前方に駐車禁止ゾーンがあります。」
- 「注意：前方に信号機があります。停車の準備をしてください。」
- 「この道路の制限速度は時速30キロです。スクールゾーンですので安全運転をお願いします。」
- 「いいえ、駐車はできません。付近に駐車禁止の標識があります。」`;

export function useVoiceAgent() {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const agentRef = useRef<RealtimeAgent | null>(null);
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addedItemIds = useRef<Set<string>>(new Set());

  const addMessage = useCallback((role: 'agent' | 'user', text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, timestamp: new Date() },
    ]);
  }, []);

  const initAgent = useCallback(() => {
    const agent = new RealtimeAgent({
      name: 'Car Assistant',
      instructions: AGENT_PROMPTS,
      tools: [
        getCurrentContextTool,
        checkParkingTool,
        getSpeedLimitTool,
        getZoneInfoTool,
        getAllSignsTool,
      ],
    });
    agentRef.current = agent;
    return agent;
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      const res = await fetch('/api/token', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get token');
      }
      const { token } = await res.json();

      const agent = initAgent();
      const session = new RealtimeSession(agent, {
        model: 'gpt-4o-mini-realtime-preview',
        config: {
          outputModalities: ['audio'],
          audio: {
            input: {
              format: 'pcm16',
              transcription: { model: 'gpt-4o-mini-transcribe' },
            },
            output: { format: 'pcm16' },
          },
        },
      });

      session.on('history_updated', (history) => {
        history.forEach((item) => {
          if (item.type !== 'message') return;

          console.log('item', item);

          if (
            item.role === 'assistant' &&
            item.status === 'completed' &&
            !addedItemIds.current.has(item.itemId)
          ) {
            const audioContent = item.content?.find(
              (c) => c.type === 'output_audio',
            ) as { type: 'output_audio'; transcript?: string | null } | undefined;
            const transcript = audioContent?.transcript ?? null;
            if (transcript) {
              addedItemIds.current.add(item.itemId);
              addMessage('agent', transcript);
              setStatus('connected');
            }
          }

          if (
            item.role === 'user' &&
            item.status === 'completed' &&
            !addedItemIds.current.has(item.itemId)
          ) {
            const audioContent = item.content?.find(
              (c) => c.type === 'input_audio',
            ) as { type: 'input_audio'; transcript: string | null } | undefined;
            const transcript = audioContent?.transcript ?? null;
            if (transcript) {
              addedItemIds.current.add(item.itemId);
              addMessage('user', transcript);
            }
          }
        });

        const lastItem = history[history.length - 1];
        if (!lastItem || lastItem.type !== 'message') return;
        if (lastItem.role === 'assistant' && lastItem.status === 'in_progress') {
          setStatus('speaking');
        }
        if (lastItem.role === 'user' && lastItem.status === 'in_progress') {
          setStatus('listening');
        }
      });

      session.on('audio', () => setStatus('speaking'));

      session.transport.on('*', (event: Record<string, unknown>) => {
        if (event.type === 'response.done') {
          setStatus('connected');
        }
      });

      await session.connect({ apiKey: token });
      sessionRef.current = session;
      setStatus('connected');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(msg);
      setStatus('error');
    }
  }, [addMessage, initAgent]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.interrupt();
      } catch {
        // ignore
      }
      sessionRef.current = null;
    }
    addedItemIds.current.clear();
    setStatus('idle');
    setIsMuted(false);
    setMessages([]);
  }, []);

  const triggerLocationUpdate = useCallback(
    (zone: Zone, car: CarPosition) => {
      agentContext.zone = zone;
      agentContext.car = car;

      if (!sessionRef.current || status === 'idle' || status === 'error') return;

      const dirLabel: Record<string, string> = { N: '北', S: '南', E: '東', W: '西' };
      sessionRef.current.sendMessage(
        `[位置情報更新] ドライバーは現在${zone.name}ゾーンの座標(${car.x}, ${car.y})にいます。` +
          `進行方向：${dirLabel[car.direction]}。` +
          `すぐにget_current_contextを呼び出し、関連する警告をドライバーに案内してください。` +
          `運転中ですので、簡潔にお願いします。`,
      );
    },
    [status],
  );

  const sendTextMessage = useCallback(
    (text: string) => {
      if (!sessionRef.current || status !== 'connected') return;
      addMessage('user', text);
      sessionRef.current.sendMessage(text);
    },
    [status, addMessage],
  );

  const toggleMute = useCallback(() => {
    if (!sessionRef.current) return;
    const newMuted = !isMuted;
    try {
      sessionRef.current.mute(newMuted);
      setIsMuted(newMuted);
    } catch {
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    messages,
    isMuted,
    error,
    connect,
    disconnect,
    triggerLocationUpdate,
    sendTextMessage,
    toggleMute,
  };
}
