'use client';

import { tool } from '@openai/agents/realtime';
import { z } from 'zod';
import { SIGN_META } from './mapData';
import {
  checkParkingAllowed,
  getSpeedLimitAtPosition,
  categorizeSignsByDirection,
  calculateDistance,
} from './signWarning';
import type { Zone, CarPosition } from './mapData';

export interface AgentContext {
  zone: Zone | null;
  car: CarPosition | null;
}

export const agentContext: AgentContext = {
  zone: null,
  car: null,
};

export const getCurrentContextTool = tool({
  name: 'get_current_context',
  description:
    '現在のゾーン名、車の位置、進行方向、および近くの交通標識の一覧を取得します。',
  parameters: z.object({}),
  execute: async () => {
    if (!agentContext.zone || !agentContext.car) {
      return 'ゾーンまたは車の位置がまだ読み込まれていません。まずゾーンを選択し、マップ上に車を配置するようユーザーに案内してください。';
    }
    const { zone, car } = agentContext;
    const { current, upcoming } = categorizeSignsByDirection(car, zone.signs);

    console.log('zone', zone);
    console.log('car', car);
    console.log('current', current);
    console.log('upcoming', upcoming);
    console.log('---------------------------');

    return JSON.stringify({
      zone: zone.name,
      description: zone.description,
      carPosition: { x: car.x, y: car.y },
      heading: car.direction,
      signsAtCurrentLocation: current.map((s) => ({
        type: s.type,
        label: SIGN_META[s.type].label,
        position: { x: s.x, y: s.y },
      })),
      signsAhead: upcoming.map((s) => ({
        type: s.type,
        label: SIGN_META[s.type].label,
        position: { x: s.x, y: s.y },
        distanceUnits: Math.round(calculateDistance(car.x, car.y, s.x, s.y)),
      })),
    });
  },
});

export const checkParkingTool = tool({
  name: 'check_parking',
  description: '現在の車の位置で駐車が許可されているかどうかを確認します。',
  parameters: z.object({}),
  execute: async () => {
    if (!agentContext.zone || !agentContext.car) {
      return 'ゾーンまたは車が読み込まれていません。駐車確認ができません。';
    }
    const result = checkParkingAllowed(agentContext.car, agentContext.zone);
    return JSON.stringify(result);
  },
});

export const getSpeedLimitTool = tool({
  name: 'get_speed_limit',
  description: '近くの速度標識に基づいて、現在の道路の制限速度を取得します。',
  parameters: z.object({}),
  execute: async () => {
    if (!agentContext.zone || !agentContext.car) {
      return 'ゾーンまたは車が読み込まれていません。制限速度を取得できません。';
    }
    const result = getSpeedLimitAtPosition(agentContext.car, agentContext.zone);
    return JSON.stringify(result);
  },
});

export const getZoneInfoTool = tool({
  name: 'get_zone_info',
  description: '現在の走行ゾーンに関する一般情報を取得します。',
  parameters: z.object({}),
  execute: async () => {
    if (!agentContext.zone) {
      return 'ゾーンがまだ読み込まれていません。';
    }
    const { zone } = agentContext;
    return JSON.stringify({
      name: zone.name,
      description: zone.description,
      totalSigns: zone.signs.length,
      signTypes: [...new Set(zone.signs.map((s) => SIGN_META[s.type].label))],
      roads: zone.roads.map((r) => r.name).filter(Boolean),
    });
  },
});

export const getAllSignsTool = tool({
  name: 'get_all_signs',
  description: '現在のゾーン内のすべての交通標識を位置と説明とともに一覧表示します。',
  parameters: z.object({}),
  execute: async () => {
    if (!agentContext.zone) {
      return 'ゾーンがまだ読み込まれていません。';
    }
    const signs = agentContext.zone.signs.map((s) => ({
      type: s.type,
      label: SIGN_META[s.type].label,
      position: { x: s.x, y: s.y },
      warning: SIGN_META[s.type].warning,
    }));
    return JSON.stringify(signs);
  },
});
