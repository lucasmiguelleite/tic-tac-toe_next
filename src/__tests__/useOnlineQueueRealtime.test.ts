import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnlineQueueRealtime } from '@/hooks/useOnlineQueueRealtime';

type Listener = (event: Event & { data?: string }) => void;
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  listeners = new Map<string, Listener[]>();
  close = vi.fn();
  constructor(readonly url: string) { MockWebSocket.instances.push(this); }
  addEventListener(type: string, listener: Listener) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]); }
  emit(type: string, data?: string) { this.listeners.get(type)?.forEach((listener) => listener({ type, data } as Event & { data?: string })); }
}

describe('useOnlineQueueRealtime', () => {
  afterEach(() => { vi.unstubAllGlobals(); MockWebSocket.instances = []; });

  it('enters the queue websocket and handles a match event', () => {
    vi.stubGlobal('WebSocket', MockWebSocket);
    const onMatch = vi.fn();
    renderHook(() => useOnlineQueueRealtime('q1', true, onMatch));
    const socket = MockWebSocket.instances[0];
    expect(socket.url).toContain('queueId=q1');
    act(() => socket.emit('message', JSON.stringify({ type: 'queue', queue: {
      matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' },
    } })));
    expect(onMatch).toHaveBeenCalledWith('R1', 'p1', 'X');
  });
});
