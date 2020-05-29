import { userDataSource, eventLogsDataSource } from '../datasources';
import createEventHandlers from '../eventHandlers';
import { ApplicationEvent } from './applicationEvents';
import { EventBus } from './eventBus';

const eventHandlers = createEventHandlers(userDataSource, eventLogsDataSource);

export const eventBus = new EventBus<ApplicationEvent>(eventHandlers);
