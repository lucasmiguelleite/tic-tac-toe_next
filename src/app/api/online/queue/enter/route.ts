import { NextResponse } from 'next/server';
import { enterQueue } from '@/domain/onlineStore';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await enterQueue(body.nickname);
  return NextResponse.json(result);
}
