import 'reflect-metadata';
import { container } from 'tsyringe';

import SystemQueries from './SystemQueries';

const systemQueries = container.resolve(SystemQueries);

test('Healthcheck should pass', () => {
  return expect(systemQueries.connectivityCheck()).resolves.toBeTruthy();
});
