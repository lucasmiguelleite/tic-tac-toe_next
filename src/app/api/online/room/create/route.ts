import { NextResponse } from 'next/server';
import { cleanup, createRoom } from '@/domain/onlineStore';

export async function POST(request: Request) {
  await cleanup();
  const body = await request.json().catch(() => ({}));
  const result = await createRoom(body.nickname);
  return NextResponse.json(result, { status: 201 });
}
