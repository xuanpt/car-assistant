'use client';

import { useState, useCallback } from 'react';
import MapCanvas from '@/components/MapCanvas';
import ControlPanel from '@/components/ControlPanel';
import AgentLog from '@/components/AgentLog';
import { useVoiceAgent } from '@/lib/useVoiceAgent';
import { randomZone, randomCarPosition } from '@/lib/mapData';
import type { Zone, CarPosition } from '@/lib/mapData';

export default function HomePage() {
  const [zone, setZone] = useState<Zone | null>(null);
  const [car, setCar] = useState<CarPosition | null>(null);
  const { status, messages, isMuted, error, connect, disconnect, triggerLocationUpdate, toggleMute } =
    useVoiceAgent();

  const handleRandomZone = useCallback(() => {
    const newZone = randomZone();
    setZone(newZone);
    setCar(null);
  }, []);

  const handleRandomCar = useCallback(() => {
    if (!zone) return;
    const newCar = randomCarPosition(zone);
    setCar(newCar);
    triggerLocationUpdate(zone, newCar);
  }, [zone, triggerLocationUpdate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">カーアシスタント</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 overflow-hidden">
        <div className="flex flex-col p-4 gap-4 overflow-auto">
          {!zone && (
            <div className="bg-blue-950/50 border border-blue-900 rounded-xl p-4 text-sm text-blue-300">
              <p className="font-semibold text-blue-200 mb-2">デモの指示</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-400">
                <li dangerouslySetInnerHTML={{ __html: '<b>エージェント起動</b> をクリックして音声アシスタントを接続' }} />
                <li dangerouslySetInnerHTML={{ __html: '<b>ランダムゾーン</b> をクリックしてランダムなマップエリアを作成' }} />
                <li dangerouslySetInnerHTML={{ __html: '<b>ランダム位置</b> をクリックしてマップ上にランダムな位置を作成' }} />
                <li>エージェントが近くの標識を自動的に警告します</li>
                <li>「ここに駐車できますか？」「制限速度は？」など、現在の交通状況についてエージェントに質問してください</li>
              </ol>
            </div>
          )}

          <MapCanvas zone={zone} car={car} />

          {zone && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                方向の凡例
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-blue-400" />
                  車の位置
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-red-500" />
                  現在地の標識
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-yellow-500" />
                  進行方向の標識
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-gray-600" />
                  後方 / 遠距離
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col border-l border-gray-800 overflow-hidden">
          {/* Control panel */}
          <div className="p-4 border-b border-gray-800 overflow-y-auto">
            <ControlPanel
              zone={zone}
              agentStatus={status}
              isMuted={isMuted}
              error={error}
              onRandomZone={handleRandomZone}
              onRandomCar={handleRandomCar}
              onConnect={connect}
              onDisconnect={disconnect}
              onToggleMute={toggleMute}
            />
          </div>

          {/* Agent conversation log */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 pt-3 pb-2 border-b border-gray-800">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                会話
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <AgentLog messages={messages} status={status} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
