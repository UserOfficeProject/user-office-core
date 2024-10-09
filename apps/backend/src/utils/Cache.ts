import TTLCache from '@isaacs/ttlcache';
import { logger } from '@user-office-software/duo-logger';

export interface ICache<T> {
  get(id: string): T | undefined;
  put(id: string, value: T): void;
  remove(id: string): void;
  size(): number;
  getStats(): { [key: string]: number };
  resetStats(): void;
  enableStatsLogging(cacheName: string, intervalSeconds?: number): void;
}

export class Cache<T> implements ICache<T> {
  private maxEntries: number;
  private millisecondsToLive: number;
  private ttlCache: TTLCache<string, any>;

  private hits = 0;
  private misses = 0;
  private additions = 0;
  private updates = 0;
  private removals = 0;

  public constructor(maxEntries: number, secondsToLive?: number) {
    this.maxEntries = maxEntries;
    this.millisecondsToLive = secondsToLive ? secondsToLive * 1000 : 10000;
    this.ttlCache = new TTLCache({
      max: this.maxEntries,
      ttl: this.millisecondsToLive,
    });
  }

  /**
   * Fetches an entry from the cache by its ID.
   *
   * @param id The ID of the entry to be retrieved
   * @returns The value of the cache entry, or undefined if no entry was found
   */
  public get(id: string): T | undefined {
    const cacheValue = this.ttlCache.get(id);
    if (!cacheValue) {
      this.misses += 1;

      return undefined;
    }
    if (cacheValue == undefined) {
      this.misses += 1;

      return undefined;
    }
    this.hits += 1;

    return cacheValue;
  }

  /**
   * Removes an entry from the cache by its ID.
   * @param id The ID of the entry to be deleted
   */
  public remove(id: string): void {
    this.ttlCache.delete(id);
    this.removals += 1;
  }

  /**
   * Adds the given value to the cache, identified by the given ID.
   *
   * @param id The ID of the new entry
   * @param value The value to be stored against the ID
   */
  public put(id: string, value: T): void {
    if (this.ttlCache.has(id)) {
      this.ttlCache.set(id, value);
      this.updates += 1;
    } else {
      this.ttlCache.set(id, value);
      this.additions += 1;
    }
  }

  /**
   * Returns the number of entries in the cache
   * @returns The total entries in the cache
   */
  public size(): number {
    return this.ttlCache.size;
  }

  /**
   * Returns various usage statistics about the cache,
   * such as the total hits and misses so far
   * @returns An object with each statistic as the key and a number as the value
   */
  public getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      additions: this.additions,
      updates: this.updates,
      removals: this.removals,
      entries: this.ttlCache.size,
      maxEntries: this.maxEntries,
    };
  }

  /**
   * Resets all cache statistics to their initial value
   */
  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.additions = 0;
    this.updates = 0;
    this.removals = 0;
  }

  /**
   * Starts a timer which will log the cache statistics
   * at a given interval. The statistics are reset after each log message.
   * The cacheName can be used to identify the cache's stats in the logs,
   * so it should be unique for each cache (or group of caches)
   * @param cacheName The name that the stats will be logged with
   * @param intervalSeconds The number of seconds to wait between log messages (300 by default)
   */
  public enableStatsLogging(
    cacheName: string,
    intervalSeconds?: number
  ): Cache<T> {
    const loggingFrequencySeconds = intervalSeconds ?? 300;

    setInterval(() => {
      logger.logInfo(
        `Cache statistics for the last ${loggingFrequencySeconds} seconds`,
        {
          cache: cacheName,
          stats: this.getStats(),
          loggingFrequencySeconds: loggingFrequencySeconds,
        }
      );
      this.resetStats();
    }, loggingFrequencySeconds * 1000);

    return this;
  }
}
