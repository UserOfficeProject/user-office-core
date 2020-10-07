import {
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDatasource,
} from '../datasources';
import createEventHandlers from '../eventHandlers';
import { ApplicationEvent } from './applicationEvents';
import { EventBus } from './eventBus';

const eventHandlers = createEventHandlers({
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDataSource: instrumentDatasource,
});

export const eventBus = new EventBus<ApplicationEvent>(eventHandlers);
