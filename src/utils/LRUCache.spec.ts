import { logger } from '@user-office-software/duo-logger';

import { LRUCache } from './LRUCache';

// put
test('When the cache does not have a value, it is added', () => {
  const cache = new LRUCache(1);
  cache.put('id1', 'abc');

  const result = cache.get('id1');

  expect(result).toEqual('abc');
  expect(cache.size()).toEqual(1);
});

test('When the cache already has a value, it is overwritten', () => {
  const cache = new LRUCache(1);
  cache.put('id1', 'abc');
  cache.put('id1', 'xyz');

  const result = cache.get('id1');

  expect(result).toEqual('xyz');
  expect(cache.size()).toEqual(1);
});

test('When inserting more values than the limit, the least recently used value is removed and the new one is inserted', () => {
  const cache = new LRUCache(2);
  cache.put('id1', 'abc');
  cache.put('id2', 'xyz');

  cache.get('id2');
  cache.get('id1');

  cache.put('id3', 'qrs');

  const mostRecentlyUsed = cache.get('id1');
  expect(mostRecentlyUsed).toEqual('abc');

  const leastRecentlyUsed = cache.get('id2');
  expect(leastRecentlyUsed).toEqual(undefined);

  const newValue = cache.get('id3');
  expect(newValue).toEqual('qrs');

  expect(cache.size()).toEqual(2);
});

// get
test('When the cache has a value, it is returned', () => {
  const cache = new LRUCache(1);
  cache.put('id1', 'abc');

  const result = cache.get('id1');

  expect(result).toEqual('abc');
});

test('When the cache has an expired value, no value is returned', () => {
  const cache = new LRUCache(1, -100);
  cache.put('id1', 'abc');

  const result = cache.get('id1');

  expect(result).toEqual(undefined);
});

test('When the cache does not have a value, no value is returned', () => {
  const cache = new LRUCache(1);

  const result = cache.get('id1');

  expect(result).toEqual(undefined);
});

// remove
test('When the cache has a value, it can be removed', () => {
  const cache = new LRUCache(1);
  cache.put('id1', 'abc');

  cache.remove('id1');
  const result = cache.get('id1');

  expect(result).toEqual(undefined);
  expect(cache.size()).toEqual(0);
});

test('When the cache does not have a value, removing it has no effect', () => {
  const cache = new LRUCache(1);
  cache.put('id1', 'abc');

  cache.remove('id2');
  const result = cache.get('id1');

  expect(result).toEqual('abc');
  expect(cache.size()).toEqual(1);
});

// getStats
test('When cache operations are performed, the statistics are updated', () => {
  const cache = new LRUCache(1);

  cache.get('nonexistent-id'); // 1 miss
  cache.put('id1', 'abc'); // 1 addition
  cache.put('id1', 'xyz'); // 1 update
  cache.get('id1'); // 1 hit
  cache.remove('id1'); // 1 removal

  expect(cache.getStats()).toEqual({
    hits: 1,
    misses: 1,
    additions: 1,
    updates: 1,
    removals: 1,
    entries: 0,
    maxEntries: 1,
  });
});

// resetStats
test('When cache statistics are reset, all values return to 0 aside from entries count', () => {
  const cache = new LRUCache(1);

  cache.get('nonexistent-id'); // 1 miss
  cache.put('id1', 'abc'); // 1 addition
  cache.put('id1', 'xyz'); // 1 update
  cache.get('id1'); // 1 hit
  cache.remove('id1'); // 1 removal

  cache.put('id2', 'test'); // Leaves 1 entry

  cache.resetStats();

  expect(cache.getStats()).toEqual({
    hits: 0,
    misses: 0,
    additions: 0,
    updates: 0,
    removals: 0,
    entries: 1,
    maxEntries: 1,
  });
});

// enableStatsLogging
test('When statistics logging is enabled, statistics are logged periodically', () => {
  jest.useFakeTimers();
  const setInterval = jest.spyOn(global, 'setInterval');
  const infoLogger = jest.spyOn(logger, 'logInfo');

  const cache = new LRUCache(1).enableStatsLogging('name', 10);
  cache.put('id1', 'abc');

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(infoLogger).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(10000);
  expect(infoLogger).toHaveBeenCalledTimes(1);
});
