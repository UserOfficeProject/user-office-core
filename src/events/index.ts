import createEventHandlers from '../eventHandlers';
import { ApplicationEvent } from './applicationEvents';
import { EventBus } from './eventBus';

const eventHandlers = createEventHandlers();

export const eventBus = new EventBus<ApplicationEvent>(eventHandlers);
