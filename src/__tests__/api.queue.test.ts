import { describe, it, expect, vi } from 'vitest';

vi.mock('@/domain/onlineStore', () => ({
  cleanup: vi.fn(),
  enterQueue: vi.fn(),
  pollQueue: vi.fn(),
  exitQueue: vi.fn(),
}));

import { POST as enter } from '@/app/api/online/queue/enter/route';
import { GET as poll } from '@/app/api/online/queue/poll/route';
import { POST as exitQueueRoute } from '@/app/api/online/queue/exit/route';
import * as store from '@/domain/onlineStore';

const json = async (res: Response) => res.json();

describe('POST /api/online/queue/enter', () => {
  it('returns queue data when no match found', async () => {
    vi.mocked(store.enterQueue).mockReturnValue({
      queueId: 'q1', matched: false, matchResult: null,
    });
    const req = new Request('http://localhost/api/online/queue/enter', {
      method: 'POST', body: JSON.stringify({ nickname: 'Alice' }),
    });
    const res = await enter(req);
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ queueId: 'q1', matched: false, matchResult: null });
  });

  it('returns match data when matched immediately', async () => {
    vi.mocked(store.enterQueue).mockReturnValue({
      queueId: 'q2', matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' },
    });
    const req = new Request('http://localhost/api/online/queue/enter', {
      method: 'POST', body: JSON.stringify({ nickname: 'Bob' }),
    });
    const res = await enter(req);
    const data = await json(res);
    expect(data.matched).toBe(true);
    expect(data.matchResult.roomId).toBe('R1');
  });

  it('works without body', async () => {
    vi.mocked(store.enterQueue).mockReturnValue({
      queueId: 'q3', matched: false, matchResult: null,
    });
    const req = new Request('http://localhost/api/online/queue/enter', { method: 'POST' });
    const res = await enter(req);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/online/queue/poll', () => {
  it('returns 400 if queueId missing', async () => {
    const req = new Request('http://localhost/api/online/queue/poll');
    const res = await poll(req);
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe('queueId is required');
  });

  it('returns 404 if queue entry not found', async () => {
    vi.mocked(store.pollQueue).mockReturnValue(null);
    const req = new Request('http://localhost/api/online/queue/poll?queueId=q1');
    const res = await poll(req);
    expect(res.status).toBe(404);
  });

  it('returns match data when matched', async () => {
    vi.mocked(store.pollQueue).mockReturnValue({
      matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' },
    });
    const req = new Request('http://localhost/api/online/queue/poll?queueId=q1');
    const res = await poll(req);
    expect(res.status).toBe(200);
    const data = await json(res);
    expect(data.matched).toBe(true);
  });

  it('returns unmatched status', async () => {
    vi.mocked(store.pollQueue).mockReturnValue({
      matched: false, matchResult: null,
    });
    const req = new Request('http://localhost/api/online/queue/poll?queueId=q1');
    const res = await poll(req);
    const data = await json(res);
    expect(data.matched).toBe(false);
  });
});

describe('POST /api/online/queue/exit', () => {
  it('returns 400 if queueId missing', async () => {
    const req = new Request('http://localhost/api/online/queue/exit', {
      method: 'POST', body: JSON.stringify({}),
    });
    const res = await exitQueueRoute(req);
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe('queueId is required');
  });

  it('exits queue and returns success', async () => {
    const req = new Request('http://localhost/api/online/queue/exit', {
      method: 'POST', body: JSON.stringify({ queueId: 'q1' }),
    });
    const res = await exitQueueRoute(req);
    expect(res.status).toBe(200);
    expect((await json(res)).success).toBe(true);
    expect(store.exitQueue).toHaveBeenCalledWith('q1');
  });
});
