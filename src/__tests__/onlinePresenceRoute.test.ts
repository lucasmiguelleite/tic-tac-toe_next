import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/online/presence/route';
import { _resetStore, getOnlinePlayerCount } from '@/domain/onlineStore';

const postRequest = (body: unknown) => new Request('http://localhost/api/online/presence', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

beforeEach(async () => {
  await _resetStore();
});

describe('online presence route', () => {
  it('registers an active player and returns the count', async () => {
    const response = await POST(postRequest({ presenceId: 'player-one' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('removes a player through the unload beacon action', async () => {
    await POST(postRequest({ presenceId: 'player-one' }));
    const response = await POST(postRequest({ presenceId: 'player-one', action: 'leave' }));

    expect(await response.json()).toEqual({ count: 0 });
    expect(await getOnlinePlayerCount()).toBe(0);
  });

  it('rejects an invalid presence id', async () => {
    const response = await POST(postRequest({ presenceId: 'bad id' }));

    expect(response.status).toBe(400);
  });
});
