export type SignType =
  | 'no_parking'
  | 'speed_limit_30'
  | 'speed_limit_60'
  | 'speed_limit_80'
  | 'traffic_light'
  | 'stop_sign'
  | 'crossing'
  | 'no_entry'
  | 'yield';

export type Direction = 'N' | 'S' | 'E' | 'W';

export interface Sign {
  id: string;
  type: SignType;
  x: number;
  y: number;
  label?: string;
}

export interface Road {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  name?: string;
}

export interface Zone {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  roads: Road[];
  signs: Sign[];
}

export interface CarPosition {
  x: number;
  y: number;
  direction: Direction;
}

export const SIGN_META: Record<SignType, { emoji: string; label: string; warning: string }> = {
  no_parking: {
    emoji: '🚫',
    label: '駐車禁止',
    warning: '近くに駐車禁止ゾーンがあります。ここには駐車できません。',
  },
  speed_limit_30: {
    emoji: '🔢',
    label: '制限速度30',
    warning: '前方の制限速度は時速30キロです。速度を落としてください。',
  },
  speed_limit_60: {
    emoji: '🔢',
    label: '制限速度60',
    warning: 'この道路の制限速度は時速60キロです。',
  },
  speed_limit_80: {
    emoji: '🔢',
    label: '制限速度80',
    warning: 'この道路の制限速度は時速80キロです。',
  },
  traffic_light: {
    emoji: '🚦',
    label: '信号機',
    warning: '前方に信号機があります。停車の準備をしてください。',
  },
  stop_sign: {
    emoji: '🛑',
    label: '一時停止',
    warning: '前方に一時停止標識があります。完全に停車してください。',
  },
  crossing: {
    emoji: '🚸',
    label: '横断歩道',
    warning: '前方に横断歩道があります。歩行者に注意してください。',
  },
  no_entry: {
    emoji: '⛔',
    label: '進入禁止',
    warning: '前方は進入禁止ゾーンです。この方向には進まないでください。',
  },
  yield: {
    emoji: '⚠️',
    label: '徐行',
    warning: '前方に徐行標識があります。対向車に道を譲ってください。',
  },
};

export const FIXED_ROADS: Road[] = [
  { id: 'h1', x1: 5, y1: 20, x2: 95, y2: 20, name: '北通り' },
  { id: 'h2', x1: 5, y1: 55, x2: 95, y2: 55, name: 'メイン通り' },
  { id: 'h3', x1: 5, y1: 88, x2: 95, y2: 88, name: '南通り' },
  { id: 'v1', x1: 20, y1: 5, x2: 20, y2: 95, name: '一番街' },
  { id: 'v2', x1: 40, y1: 5, x2: 40, y2: 95, name: '二番街' },
  { id: 'v3', x1: 60, y1: 5, x2: 60, y2: 95, name: '三番街' },
  { id: 'v4', x1: 80, y1: 5, x2: 80, y2: 95, name: '四番街' },
];

const SIGN_SLOTS: { x: number; y: number }[] = [
  { x: 20, y: 20 }, { x: 40, y: 20 }, { x: 60, y: 20 }, { x: 80, y: 20 },
  { x: 20, y: 55 }, { x: 40, y: 55 }, { x: 60, y: 55 }, { x: 80, y: 55 },
  { x: 20, y: 88 }, { x: 40, y: 88 }, { x: 60, y: 88 }, { x: 80, y: 88 },
  // Mid-road slots (between intersections)
  { x: 5,  y: 20 }, { x: 5,  y: 55 }, { x: 5,  y: 88 },
  { x: 20, y: 5  }, { x: 40, y: 5  }, { x: 60, y: 5  }, { x: 80, y: 5  },
];

const ALL_SIGN_TYPES: SignType[] = [
  'no_parking', 'speed_limit_30', 'speed_limit_60', 'speed_limit_80',
  'traffic_light', 'stop_sign', 'crossing', 'no_entry', 'yield',
];

const ZONE_CONFIGS: { id: string; name: string; description: string; signCount: number; preferredTypes: SignType[] }[] = [
  {
    id: 'shibuya',
    name: '渋谷',
    description: '駐車規制が厳しい、賑やかな都市型ショッピングエリア',
    signCount: 8,
    preferredTypes: ['no_parking', 'traffic_light', 'crossing', 'stop_sign'],
  },
  {
    id: 'downtown',
    name: '都心部',
    description: '交差点が多く交通量の多い市街地中心エリア',
    signCount: 9,
    preferredTypes: ['traffic_light', 'speed_limit_30', 'no_parking', 'yield'],
  },
  {
    id: 'school_zone',
    name: 'スクールゾーン',
    description: '学校に近い住宅街で速度制限が低いエリア',
    signCount: 8,
    preferredTypes: ['speed_limit_30', 'crossing', 'stop_sign', 'no_parking'],
  },
  {
    id: 'highway',
    name: '高速道路入口',
    description: '速度制限が高い高速道路の入口付近エリア',
    signCount: 7,
    preferredTypes: ['speed_limit_80', 'speed_limit_60', 'no_entry', 'yield'],
  },
  {
    id: 'suburb',
    name: '閑静な住宅街',
    description: '交通規制が緩やかな住宅地エリア',
    signCount: 6,
    preferredTypes: ['speed_limit_30', 'crossing', 'yield', 'stop_sign'],
  },
];

function generateSigns(config: typeof ZONE_CONFIGS[0]): Sign[] {
  const shuffledSlots = [...SIGN_SLOTS].sort(() => Math.random() - 0.5);
  const chosenSlots = shuffledSlots.slice(0, config.signCount);

  return chosenSlots.map((slot, i) => {
    const pool = Math.random() < 0.6 ? config.preferredTypes : ALL_SIGN_TYPES;
    const type = pool[Math.floor(Math.random() * pool.length)];
    return { id: `s${i + 1}`, type, x: slot.x, y: slot.y };
  });
}

function buildZone(config: typeof ZONE_CONFIGS[0]): Zone {
  return {
    id: config.id,
    name: config.name,
    width: 100,
    height: 100,
    description: config.description,
    roads: FIXED_ROADS,
    signs: generateSigns(config),
  };
}

export const ZONES: Zone[] = ZONE_CONFIGS.map(buildZone);

export function getZoneById(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}

export function randomZone(): Zone {
  const config = ZONE_CONFIGS[Math.floor(Math.random() * ZONE_CONFIGS.length)];
  return buildZone(config);
}

export function randomCarPosition(zone: Zone): CarPosition {
  const road = zone.roads[Math.floor(Math.random() * zone.roads.length)];

  const isHorizontal = road.y1 === road.y2;
  const validDirections: Direction[] = isHorizontal ? ['E', 'W'] : ['N', 'S'];
  const direction = validDirections[Math.floor(Math.random() * validDirections.length)];

  const steps = 6;
  const step = Math.floor(Math.random() * (steps + 1));
  const x = Math.round(road.x1 + ((road.x2 - road.x1) / steps) * step);
  const y = Math.round(road.y1 + ((road.y2 - road.y1) / steps) * step);

  return { x, y, direction };
}
