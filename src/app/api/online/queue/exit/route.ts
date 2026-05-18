import { NextResponse } from 'next/server';
import { cleanup, exitQueue } from '@/domain/onlineStore';

export async function POST(request: Request) {
  await cleanup();
  const { queueId } = await request.json();
  if (!queueId) {
    return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
  }
  await exitQueue(queueId);
  return NextResponse.json({ success: true });
}
