'use client';

import { useEffect, useRef } from 'react';
import type { AgentMessage } from '@/lib/voiceAgent';
import type { AgentStatus } from '@/lib/voiceAgent';

interface AgentLogProps {
  messages: AgentMessage[];
  status: AgentStatus;
}

const STATUS_COLORS: Record<AgentStatus, { color: string; pulse: boolean }> = {
  idle: { color: 'bg-gray-400', pulse: false },
  connecting: { color: 'bg-yellow-500', pulse: true },
  connected: { color: 'bg-green-500', pulse: false },
  speaking: { color: 'bg-blue-500', pulse: true },
  listening: { color: 'bg-purple-500', pulse: true },
  error: { color: 'bg-red-500', pulse: false },
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: '未接続',
  connecting: '接続中...',
  connected: '準備完了',
  speaking: 'エージェント発話中',
  listening: '聞き取り中...',
  error: 'エラー',
};

export default function AgentLog({ messages, status }: AgentLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { color, pulse } = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Status bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="relative flex h-2.5 w-2.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
        </span>
        <span className="text-xs text-gray-500 font-mono">{label}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center px-4">
            <div>
              <div className="text-3xl mb-2">🎙️</div>
              <p>エージェントを起動してマップ上に車を配置すると開始します。</p>
              <p className="mt-1 text-gray-300">会話はここに表示されます。</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs opacity-60 font-mono">
                    {msg.role === 'agent' ? '🚗 アシスタント' : '👤 あなた'}
                  </span>
                  <span className="text-xs opacity-40">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
