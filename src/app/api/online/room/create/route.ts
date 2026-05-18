import { NextResponse } from 'next/server';
import { createRoom } from '@/domain/onlineStore';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await createRoom(body.nickname);
  return NextResponse.json(result, { status: 201 });
}
