import { NextResponse } from 'next/server';
import { getOnlinePlayerCount, markPlayerOffline, markPlayerOnline } from '@/domain/onlineStore';

export const dynamic = 'force-dynamic';

const isValidPresenceId = (value: unknown): value is string => (
  typeof value === 'string' && /^[a-zA-Z0-9-]{1,128}$/.test(value)
);

const countResponse = async () => NextResponse.json(
  { count: await getOnlinePlayerCount() },
  { headers: { 'Cache-Control': 'no-store' } },
);

export async function GET() {
  return countResponse();
}

export async function POST(request: Request) {
  const { presenceId, action } = await request.json().catch(() => ({}));
  if (!isValidPresenceId(presenceId)) {
    return NextResponse.json({ error: 'presenceId is required' }, { status: 400 });
  }

  if (action === 'leave') {
    await markPlayerOffline(presenceId);
    return countResponse();
  }

  await markPlayerOnline(presenceId);
  return countResponse();
}

export async function DELETE(request: Request) {
  const { presenceId } = await request.json().catch(() => ({}));
  if (!isValidPresenceId(presenceId)) {
    return NextResponse.json({ error: 'presenceId is required' }, { status: 400 });
  }

  await markPlayerOffline(presenceId);
  return countResponse();
}
