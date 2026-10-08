import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnlineRealtime } from '@/hooks/useOnlineRealtime';

type Listener = (event: Event & { data?: string }) => void;

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  readonly listeners = new Map<string, Listener[]>();
  close = vi.fn();

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  emit(type: string, data?: string) {
    this.listeners.get(type)?.forEach((listener) => listener({ type, data } as Event & { data?: string }));
  }
}

describe('useOnlineRealtime', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    MockWebSocket.instances = [];
  });

  it('refreshes state after connecting and when a room update arrives', () => {
    vi.stubGlobal('WebSocket', MockWebSocket);
    const onRoomUpdated = vi.fn();
    renderHook(() => useOnlineRealtime('ABC123', 'p1', true, onRoomUpdated));

    const socket = MockWebSocket.instances[0];
    expect(socket.url).toContain('/api/online/realtime?roomId=ABC123&playerId=p1');

    act(() => socket.emit('open'));
    act(() => socket.emit('message', JSON.stringify({ type: 'room-updated' })));
    act(() => socket.emit('message', 'not-json'));

    expect(onRoomUpdated).toHaveBeenCalledTimes(2);
  });

  it('does not open a socket while disabled', () => {
    vi.stubGlobal('WebSocket', MockWebSocket);
    renderHook(() => useOnlineRealtime('ABC123', 'p1', false, vi.fn()));
    expect(MockWebSocket.instances).toHaveLength(0);
  });
});
