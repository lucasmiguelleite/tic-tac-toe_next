import { NextResponse } from 'next/server';
import { exitQueue } from '@/domain/onlineStore';

export async function POST(request: Request) {
  const { queueId } = await request.json();
  if (!queueId) {
    return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
  }
  await exitQueue(queueId);
  return NextResponse.json({ success: true });
}
