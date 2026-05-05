import { NextResponse } from 'next/server';
import { ZONES } from '@/lib/mapData';

export async function GET() {
  return NextResponse.json({ zones: ZONES });
}
