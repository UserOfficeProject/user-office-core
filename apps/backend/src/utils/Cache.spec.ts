import { logger } from '@user-office-software/duo-logger';

import { Cache } from './Cache';

// getStats
test('When cache operations are performed, the statistics are updated', () => {
  const cache = new Cache(1);

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
  const cache = new Cache(1);

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

  const cache = new Cache(1).enableStatsLogging('name', 10);
  cache.put('id1', 'abc');

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(infoLogger).toHaveBeenCalledTimes(0);

  jest.advanceTimersByTime(10000);
  expect(infoLogger).toHaveBeenCalledTimes(1);
});
