import { NextResponse } from 'next/server';
import { cleanup, pollQueue } from '@/domain/onlineStore';

export async function GET(request: Request) {
  cleanup();
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get('queueId');

  if (!queueId) {
    return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
  }

  const result = pollQueue(queueId);
  if (!result) {
    return NextResponse.json({ error: 'Queue entry not found or expired' }, { status: 404 });
  }

  return NextResponse.json(result);
}
