// Unit test: webhook replay idempotency logic

describe('Webhook idempotency', () => {
  // Simulates the idempotency check in PaymentsService.handleWebhook
  function buildStore() {
    const events = new Map<string, { processedAt: Date | null }>();

    function upsert(provider: string, eventId: string) {
      const key = `${provider}:${eventId}`;
      if (!events.has(key)) events.set(key, { processedAt: null });
    }

    function isProcessed(provider: string, eventId: string) {
      return events.get(`${provider}:${eventId}`)?.processedAt != null;
    }

    function markProcessed(provider: string, eventId: string) {
      events.set(`${provider}:${eventId}`, { processedAt: new Date() });
    }

    return { upsert, isProcessed, markProcessed };
  }

  it('first delivery processes the event', () => {
    const store = buildStore();
    store.upsert('stripe', 'evt_123');
    expect(store.isProcessed('stripe', 'evt_123')).toBe(false);
    store.markProcessed('stripe', 'evt_123');
    expect(store.isProcessed('stripe', 'evt_123')).toBe(true);
  });

  it('replaying the same eventId is detected as already-processed', () => {
    const store = buildStore();
    store.upsert('stripe', 'evt_123');
    store.markProcessed('stripe', 'evt_123');

    // Replay
    store.upsert('stripe', 'evt_123');
    expect(store.isProcessed('stripe', 'evt_123')).toBe(true);
  });

  it('different eventIds are independent', () => {
    const store = buildStore();
    store.upsert('khqr', 'khqr-A');
    store.markProcessed('khqr', 'khqr-A');

    store.upsert('khqr', 'khqr-B');
    expect(store.isProcessed('khqr', 'khqr-B')).toBe(false);
  });

  it('same eventId different provider is independent', () => {
    const store = buildStore();
    store.upsert('stripe', 'evt_shared');
    store.markProcessed('stripe', 'evt_shared');

    store.upsert('khqr', 'evt_shared');
    expect(store.isProcessed('khqr', 'evt_shared')).toBe(false);
  });
});
