import type { Sign, Direction, CarPosition, Zone } from './mapData';
import { SIGN_META } from './mapData';

export interface CategorizedSigns {
  current: Sign[];
  upcoming: Sign[];
  behind: Sign[];
}

export interface ProximityWarning {
  sign: Sign;
  distance: number;
  category: 'current' | 'upcoming';
  warningText: string;
}

const CURRENT_RADIUS = 8;
const UPCOMING_RADIUS = 25;
const LANE_TOLERANCE = 8;

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function categorizeSignsByDirection(
  car: CarPosition,
  signs: Sign[],
): CategorizedSigns {
  const current: Sign[] = [];
  const upcoming: Sign[] = [];
  const behind: Sign[] = [];

  signs.forEach((sign) => {
    const dist = calculateDistance(car.x, car.y, sign.x, sign.y);

    if (dist > UPCOMING_RADIUS) {
      behind.push(sign);
      return;
    }

    if (dist <= CURRENT_RADIUS) {
      current.push(sign);
      return;
    }

    if (isSignAheadOnSameLane(car, sign)) {
      upcoming.push(sign);
    } else {
      behind.push(sign);
    }
  });

  return { current, upcoming, behind };
}

function isSignAheadOnSameLane(car: CarPosition, sign: Sign): boolean {
  const dx = sign.x - car.x;
  const dy = sign.y - car.y;

  switch (car.direction) {
    case 'N':
      return dy <= 0 && Math.abs(dx) <= LANE_TOLERANCE;
    case 'S':
      return dy >= 0 && Math.abs(dx) <= LANE_TOLERANCE;
    case 'E':
      return dx >= 0 && Math.abs(dy) <= LANE_TOLERANCE;
    case 'W':
      return dx <= 0 && Math.abs(dy) <= LANE_TOLERANCE;
  }
}

export function buildWarnings(
  car: CarPosition,
  zone: Zone,
): ProximityWarning[] {
  const { current, upcoming } = categorizeSignsByDirection(car, zone.signs);
  const warnings: ProximityWarning[] = [];

  current.forEach((sign) => {
    warnings.push({
      sign,
      distance: Math.round(calculateDistance(car.x, car.y, sign.x, sign.y)),
      category: 'current',
      warningText: SIGN_META[sign.type].warning,
    });
  });

  upcoming.forEach((sign) => {
    warnings.push({
      sign,
      distance: Math.round(calculateDistance(car.x, car.y, sign.x, sign.y)),
      category: 'upcoming',
      warningText: SIGN_META[sign.type].warning,
    });
  });

  warnings.sort((a, b) => {
    if (a.category !== b.category) return a.category === 'current' ? -1 : 1;
    return a.distance - b.distance;
  });

  return warnings;
}

export function checkParkingAllowed(car: CarPosition, zone: Zone): {
  allowed: boolean;
  reason: string;
} {
  const nearbyRadius = 15;
  const parkingBlockers = zone.signs.filter((sign) => {
    if (sign.type !== 'no_parking') return false;
    return calculateDistance(car.x, car.y, sign.x, sign.y) <= nearbyRadius;
  });

  if (parkingBlockers.length > 0) {
    return {
      allowed: false,
      reason: `現在地から${nearbyRadius}ユニット以内に駐車禁止標識があります。`,
    };
  }

  return {
    allowed: true,
    reason: '現在地付近に駐車制限は検出されませんでした。',
  };
}

export function getSpeedLimitAtPosition(car: CarPosition, zone: Zone): {
  limit: number | null;
  description: string;
} {
  const speedSigns = zone.signs.filter((s) =>
    ['speed_limit_30', 'speed_limit_60', 'speed_limit_80'].includes(s.type),
  );

  if (speedSigns.length === 0) {
    return { limit: null, description: 'このゾーンに速度制限標識は見つかりませんでした。' };
  }

  let nearest = speedSigns[0];
  let minDist = calculateDistance(car.x, car.y, nearest.x, nearest.y);

  speedSigns.forEach((sign) => {
    const d = calculateDistance(car.x, car.y, sign.x, sign.y);
    if (d < minDist) {
      minDist = d;
      nearest = sign;
    }
  });

  const limitMap: Record<string, number> = {
    speed_limit_30: 30,
    speed_limit_60: 60,
    speed_limit_80: 80,
  };

  const limit = limitMap[nearest.type];
  return {
    limit,
    description: `最寄りの標識（位置：${nearest.x}, ${nearest.y}）に基づき、制限速度は時速${limit}キロです。`,
  };
}
