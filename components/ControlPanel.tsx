"use client";

import type { Zone } from "@/lib/mapData";
import type { AgentStatus } from "@/lib/useVoiceAgent";

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
  const isConnected = agentStatus !== "idle" && agentStatus !== "error";
  const isConnecting = agentStatus === "connecting";

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
          音声エージェント
        </h3>

        {error && (
          <div className="mb-3 p-2 bg-red-950 border border-red-800 rounded-lg text-xs text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-green-600 disabled:border-gray-700 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  接続中...
                </span>
              ) : (
                "🎙️ エージェント起動"
              )}
            </button>
          ) : (
            <>
              <button
                onClick={onToggleMute}
                className={`flex-1 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border ${
                  isMuted
                    ? "bg-yellow-700 hover:bg-yellow-600 border-yellow-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
                }`}
              >
                {isMuted ? "🔇 ミュート中" : "🔊 ミュート"}
              </button>
              <button
                onClick={onDisconnect}
                className="flex-1 bg-red-900 hover:bg-red-800 active:bg-red-700 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-red-800"
              >
                ⏹ 停止
              </button>
            </>
          )}
        </div>

        {isConnected && (
          <p className="mt-2 text-xs text-gray-600 text-center">
            {agentStatus === "speaking"
              ? "🔊 エージェントが話しています..."
              : agentStatus === "listening"
                ? "🎤 聞き取り中..."
                : "✅ 話しかけるか、位置を設定してください"}
          </p>
        )}
      </div>
      {/* Map Controls */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
          マップ操作
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onRandomZone}
            className="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-gray-700"
          >
            ランダムゾーン
          </button>
          <button
            onClick={onRandomCar}
            disabled={!zone}
            className="flex-1 bg-blue-700 hover:bg-blue-600 active:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-700 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border border-blue-600 disabled:border-gray-700 disabled:cursor-not-allowed"
          >
            ランダム位置
          </button>
        </div>
      </div>
    </div>
  );
}
