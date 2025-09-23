// src/services/eventBus.ts
export type TelemetryEvent = {
  id: string;
  ts: number;
  type: string;
  details?: string;
  status?: string;
  nodeId?: string;
  before?: any;
  after?: any;
  [k: string]: any;
};

const store: TelemetryEvent[] = [];
const listeners = new Set<(ev: TelemetryEvent[]) => void>();

export function publishEvent(ev: TelemetryEvent) {
  try {
    store.push(ev);
    // keep store size bounded (e.g., last 2000 events)
    if (store.length > 2000) store.splice(0, store.length - 2000);
    // notify listeners with a shallow copy (newest last)
    const snapshot = store.slice();
    listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (e) {
        /* swallow handler errors */
      }
    });
  } catch (e) {
    console.error("eventBus.publishEvent error", e);
  }
}

export function subscribeToEvents(fn: (events: TelemetryEvent[]) => void) {
  listeners.add(fn);
  // send initial snapshot immediately
  try {
    fn(store.slice());
  } catch (e) {}
  return () => listeners.delete(fn);
}

export function getAllEvents() {
  return store.slice();
}

export function clearEvents() {
  store.length = 0;
  listeners.forEach((l) => {
    try {
      l([]);
    } catch {}
  });
}
