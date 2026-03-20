import type { EditorEvents } from './types';

type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<keyof EditorEvents, Set<Handler<any>>>();

  on<K extends keyof EditorEvents>(event: K, handler: Handler<EditorEvents[K]>): () => void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as Handler<any>);
    this.handlers.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends keyof EditorEvents>(event: K, handler: Handler<EditorEvents[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<any>);
  }

  emit<K extends keyof EditorEvents>(event: K, payload: EditorEvents[K]): void {
    this.handlers.get(event)?.forEach((h) => h(payload));
  }
}
