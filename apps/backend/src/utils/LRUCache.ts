import { logger } from '@user-office-software/duo-logger';

type CacheEntry<T> = {
  id: string;
  value: T;
  expiry: number;
  next: CacheEntry<T>;
  previous: CacheEntry<T>;
};

export interface ILRUCache<T> {
  get(id: string): T | undefined;
  put(id: string, value: T): void;
  remove(id: string): void;
  size(): number;
  getStats(): { [key: string]: number };
  resetStats(): void;
  enableStatsLogging(cacheName: string, intervalSeconds?: number): void;
}

/**
 * A simple, generic least-recently-used (LRU) cache.
 *
 * It can be used to quickly store the results of an expensive process in memory
 * and quickly retrieve it later on. It is particularly useful for calls to
 * external webservices or slow database queries.
 *
 * The cache can be configured with a maximum size and a "time to live"
 * for its entries. When it fills up, it automatically discards
 * the least recently used entry to make space for the next one.
 * When entries reach their maximum time to live, they are not automatically
 * removed from the cache but will be ignored and removed the next time they're
 * requested.
 *
 * Internally, the cache is made up of two components:
 * - A doubly linked list, which stores the values of cache entries and sets the order of the entries
 * - An index, linking the ID of an entry to its element in the linked list
 *
 * Each element in the linked list stores its ID, data and expiration date.
 * It also stores a reference to the next and previous element in the list.
 * When a cache entry is retrieved, it is moved to the start of the list by changing
 * its next/previous references, as well as the next/previous references of the elements
 * surrounding it. When elements are added, they are inserted at the top of the list.
 * Thanks to the linked list, insertion, reordering, and removal of cache entries is very fast,
 * as these operations only involve swapping some references.
 * However, it would be expensive to find an element with a given ID at an unknown position
 * in the linked list, as this might involve traversing the whole list while checking the ID
 * of each entry. To provide fast random access, a Map is used as an index for the linked list.
 * The index links an entry ID to its element in the linked list, providing fast lookup
 * of any ID.
 */
export class LRUCache<T> implements ILRUCache<T> {
  private cacheRoot: CacheEntry<T> | undefined = undefined;
  private index: Map<string, CacheEntry<T>> = new Map();
  private length = 0;

  private maxEntries: number;
  private millisecondsToLive: number;

  private hits = 0;
  private misses = 0;
  private additions = 0;
  private updates = 0;
  private removals = 0;

  public constructor(maxEntries: number, secondsToLive?: number) {
    this.maxEntries = maxEntries;
    this.millisecondsToLive = secondsToLive ? secondsToLive * 1000 : 10000;
  }

  /**
   * Fetches an entry from the cache by its ID.
   *
   * The entry (if it exists) is moved to the start of the cache
   * as it is now the most recently accessed value.
   * The time to live of the entry is **not** affected by calling this method.
   * @param id The ID of the entry to be retrieved
   * @returns The value of the cache entry, or undefined if no entry was found
   */
  public get(id: string): T | undefined {
    const cacheEntry = this.index.get(id);

    if (!cacheEntry) {
      this.misses += 1;

      return undefined;
    }

    if (cacheEntry.expiry < Date.now()) {
      this.removeEntry(cacheEntry);
      this.misses += 1;

      return undefined;
    }

    this.moveToRoot(cacheEntry);
    this.hits += 1;

    return cacheEntry.value;
  }

  /**
   * Removes an entry from the cache by its ID.
   * @param id The ID of the entry to be deleted
   */
  public remove(id: string): void {
    const toDelete = this.index.get(id);

    if (!toDelete) {
      return;
    }

    this.removeEntry(toDelete);
  }

  /**
   * Adds the given value to the cache, identified by the given ID.
   * The value is added at the start of the cache.
   *
   * If an entry with the same ID already exists,
   * its value is overwritten with the one passed to this method.
   * Its time to live is also reset and the entry is moved to the start of the cache.
   *
   * If the cache has already reached its maximum number of entries,
   * the least recently used entry is automatically removed from the cache
   * to make space for the one passed to this method.
   *
   * @param id The ID of the new entry
   * @param value The value to be stored against the ID
   */
  public put(id: string, value: T): void {
    const existingEntry = this.index.get(id);

    // If the ID already exists, update the entry's data and move it to the cache root
    if (existingEntry) {
      existingEntry.value = value;
      existingEntry.expiry = Date.now() + this.millisecondsToLive;
      this.moveToRoot(existingEntry);
      this.updates += 1;

      return;
    }

    // Auto-remove last entry if the cache has reached the maximum number of entries
    if (this.length === this.maxEntries) {
      const toRemove = this.cacheRoot?.previous;
      if (toRemove) {
        this.removeEntry(toRemove);
      }
    }

    // We can't create the cache entry in one go,
    // because it needs to point to itself as the next and previous entries
    // if the cache root is undefined
    const newEntry: Partial<CacheEntry<T>> = {
      id: id,
      value: value,
      expiry: Date.now() + this.millisecondsToLive,
    };

    // We have to cast the entry to a full CacheEntry
    // to satisfy TypeScript. This is safe here,
    // because we're populating the only missing attributes
    newEntry.next = newEntry as CacheEntry<T>;
    newEntry.previous = newEntry as CacheEntry<T>;

    // The casts here are safe because we populated
    // all optional attributes above
    this.moveToRoot(newEntry as CacheEntry<T>);
    this.index.set(id, newEntry as CacheEntry<T>);

    this.length += 1;
    this.additions += 1;
  }

  /**
   * Returns the number of entries in the cache
   * @returns The total entries in the cache
   */
  public size(): number {
    return this.length;
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
      entries: this.length,
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
  ): LRUCache<T> {
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

  private removeEntry(toDelete: CacheEntry<T>): void {
    toDelete.previous.next = toDelete.next;
    toDelete.next.previous = toDelete.previous;

    this.index.delete(toDelete.id);
    this.length -= 1;
    this.removals += 1;
  }

  private moveToRoot(entry: CacheEntry<T>): void {
    if (this.cacheRoot === entry) {
      return;
    }

    entry.next.previous = entry.previous;
    entry.previous.next = entry.next;

    const root = this.cacheRoot;
    if (root) {
      entry.next = root;
      entry.previous = root.previous;
      root.previous.next = entry;
      root.previous = entry;
    } else {
      entry.next = entry;
      entry.previous = entry;
    }

    this.cacheRoot = entry;
  }
}
