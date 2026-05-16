import { NextResponse } from 'next/server';
import { cleanup, enterQueue } from '@/domain/onlineStore';

export async function POST(request: Request) {
  cleanup();
  const body = await request.json().catch(() => ({}));
  const result = enterQueue(body.nickname);
  return NextResponse.json(result);
}
