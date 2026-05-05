'use client';

import type { Zone } from '@/lib/mapData';
import type { AgentStatus } from '@/lib/useVoiceAgent';

interface ControlPanelProps {
  zone: Zone | null;
  agentStatus: AgentStatus;
  isMuted: boolean;
  error: string | null;
  onRandomZone: () => void;
  onRandomCar: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export default function ControlPanel({
  zone,
  agentStatus,
  isMuted,
  error,
  onRandomZone,
  onRandomCar,
  onConnect,
  onDisconnect,
  onToggleMute,
}: ControlPanelProps) {
  const isConnected = agentStatus !== 'idle' && agentStatus !== 'error';
  const isConnecting = agentStatus === 'connecting';

  return (
    <div className="space-y-4">
      {/* Voice Agent Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
          音声エージェント
        </h3>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex-1 bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-green-500 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  接続中...
                </span>
              ) : (
                '🎙️ エージェント起動'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={onToggleMute}
                className={`flex-1 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border ${
                  isMuted
                    ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                }`}
              >
                {isMuted ? '🔇 ミュート中' : '🔊 ミュート'}
              </button>
              <button
                onClick={onDisconnect}
                className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-red-500"
              >
                ⏹ 停止
              </button>
            </>
          )}
        </div>

        {isConnected && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            {agentStatus === 'speaking'
              ? '🔊 エージェントが話しています...'
              : agentStatus === 'listening'
                ? '🎤 聞き取り中...'
                : '✅ 話しかけるか、位置を設定してください'}
          </p>
        )}
      </div>

      {/* Map Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
          マップ操作
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onRandomZone}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-gray-300"
          >
            ランダムゾーン
          </button>
          <button
            onClick={onRandomCar}
            disabled={!zone}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-blue-500 disabled:cursor-not-allowed"
          >
            ランダム位置
          </button>
        </div>
      </div>
    </div>
  );
}
