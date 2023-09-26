import { ILRUCache } from '../LRUCache';

/* eslint-disable @typescript-eslint/no-unused-vars */
export class LRUCache<T> implements ILRUCache<T> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor(maxEntries: number, secondsToLive?: number) {}

  public get(id: string): T | undefined {
    return undefined;
  }

  public remove(id: string): void {
    return;
  }

  public put(id: string, value: T): void {
    return;
  }

  public size(): number {
    return 0;
  }

  public getStats() {
    return {
      hits: 0,
      misses: 0,
      additions: 0,
      updates: 0,
      removals: 0,
      entries: 0,
      maxEntries: 0,
    };
  }

  public resetStats(): void {
    return;
  }

  public enableStatsLogging(
    cacheName: string,
    intervalSeconds?: number
  ): LRUCache<T> {
    return this;
  }
}
