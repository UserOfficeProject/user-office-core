import {
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDatasource,
} from '../datasources';
import createEventHandlers from '../eventHandlers';
import { ApplicationEvent } from './applicationEvents';
import { EventBus } from './eventBus';

// TODO: mock this file in jest
// so we don't try to connect to a database through datasources imports
// right now it causes an unhandled rejection
const eventHandlers = createEventHandlers({
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDataSource: instrumentDatasource,
});

export const eventBus = new EventBus<ApplicationEvent>(eventHandlers);
