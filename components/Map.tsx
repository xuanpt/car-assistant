'use client';

import React, { useMemo } from 'react';
import type { Zone, CarPosition } from '@/lib/mapData';
import { SIGN_META } from '@/lib/mapData';
import { categorizeSignsByDirection } from '@/lib/signWarning';

interface MapCanvasProps {
  zone: Zone | null;
  car: CarPosition | null;
}

const MAP_SIZE = 500;
const PADDING = 30;
const INNER = MAP_SIZE - PADDING * 2;

function toSvg(val: number): number {
  return PADDING + (val / 100) * INNER;
}

const DIRECTION_ARROWS: Record<string, string> = {
  N: '↑',
  S: '↓',
  E: '→',
  W: '←',
};

const CAR_ROTATE: Record<string, number> = {
  N: 0,
  S: 180,
  E: 90,
  W: 270,
};

export default function MapCanvas({ zone, car }: MapCanvasProps) {
  const categorized = useMemo(() => {
    if (!zone || !car) return null;
    return categorizeSignsByDirection(car, zone.signs);
  }, [zone, car]);

  if (!zone) {
    return (
      <div className="flex items-center justify-center w-full bg-gray-100 rounded-xl border border-gray-200" style={{ height: '800px' }}>
        <div className="text-center text-gray-400">
          <p className="text-sm">ゾーン未選択</p>
          <p className="text-xs text-gray-300 mt-1">「ランダムゾーン」をクリックして開始</p>
        </div>
      </div>
    );
  }

  const gridLines = [20, 40, 60, 80];

  return (
    <div className="relative w-full">
      {car && (
        <div className="absolute top-2 right-3 z-10 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded font-mono shadow border border-gray-200">
          Car ({car.x},{car.y}) {DIRECTION_ARROWS[car.direction]}
        </div>
      )}

      <svg
        viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
        className="rounded-xl border border-gray-200 bg-gray-50 w-full shadow-sm"
        style={{ maxHeight: '800px', display: 'block' }}
      >
        {gridLines.map((g) => (
          <React.Fragment key={g}>
            <line
              x1={toSvg(g)}
              y1={PADDING}
              x2={toSvg(g)}
              y2={MAP_SIZE - PADDING}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <line
              x1={PADDING}
              y1={toSvg(g)}
              x2={MAP_SIZE - PADDING}
              y2={toSvg(g)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text x={toSvg(g)} y={PADDING - 6} textAnchor="middle" fill="#9ca3af" fontSize="9">
              {g}
            </text>
            <text x={PADDING - 8} y={toSvg(g) + 3} textAnchor="end" fill="#9ca3af" fontSize="9">
              {g}
            </text>
          </React.Fragment>
        ))}
        {zone.roads.map((road) => (
          <React.Fragment key={road.id}>
            <line
              x1={toSvg(road.x1)}
              y1={toSvg(road.y1)}
              x2={toSvg(road.x2)}
              y2={toSvg(road.y2)}
              stroke="#d1d5db"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1={toSvg(road.x1)}
              y1={toSvg(road.y1)}
              x2={toSvg(road.x2)}
              y2={toSvg(road.y2)}
              stroke="#e5e7eb"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1={toSvg(road.x1)}
              y1={toSvg(road.y1)}
              x2={toSvg(road.x2)}
              y2={toSvg(road.y2)}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="8,6"
              strokeLinecap="round"
            />
          </React.Fragment>
        ))}

        {car && (
          <>
            <circle
              cx={toSvg(car.x)}
              cy={toSvg(car.y)}
              r={(25 / 100) * INNER}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeDasharray="6,4"
              opacity="0.2"
            />
            <circle
              cx={toSvg(car.x)}
              cy={toSvg(car.y)}
              r={(12 / 100) * INNER}
              fill="rgba(59,130,246,0.04)"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.35"
            />
          </>
        )}

        {zone.signs.map((sign) => {
          const cx = toSvg(sign.x);
          const cy = toSvg(sign.y);
          const isCurrentSign = categorized?.current.some((s) => s.id === sign.id);
          const isUpcomingSign = categorized?.upcoming.some((s) => s.id === sign.id);
          const highlight = isCurrentSign
            ? '#EF4444'
            : isUpcomingSign
              ? '#F59E0B'
              : '#9ca3af';

          return (
            <g key={sign.id}>
              <circle cx={cx} cy={cy} r="14" fill="#ffffff" stroke={highlight} strokeWidth="2" />
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12">
                {SIGN_META[sign.type].emoji}
              </text>
              {(isCurrentSign || isUpcomingSign) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="17"
                  fill="none"
                  stroke={highlight}
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              )}
              <text
                x={cx}
                y={cy + 28}
                textAnchor="middle"
                fill={highlight}
                fontSize="7"
                fontFamily="monospace"
              >
                {SIGN_META[sign.type].label}
              </text>
            </g>
          );
        })}

        {car && (
          <g transform={`translate(${toSvg(car.x)}, ${toSvg(car.y)})`}>
            <circle cx="0" cy="2" r="12" fill="rgba(0,0,0,0.08)" />
            <circle cx="0" cy="0" r="12" fill="#2563EB" stroke="#93C5FD" strokeWidth="2" />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
              transform={`rotate(${CAR_ROTATE[car.direction]})`}
            >
              ▲
            </text>
          </g>
        )}
      </svg>

      {car && categorized && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-red-500 inline-block" />
            現在地 ({categorized.current.length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-yellow-500 inline-block" />
            前方 ({categorized.upcoming.length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-gray-400 inline-block" />
            後方 ({categorized.behind.length})
          </span>
        </div>
      )}
    </div>
  );
}
