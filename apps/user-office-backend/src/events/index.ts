import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import createEventHandlers from '../eventHandlers';
import { ApplicationEvent } from './applicationEvents';
import { EventBus } from './eventBus';

export type ApplicationEventBus = EventBus<ApplicationEvent>;

export function createApplicationEventBus() {
  const eventHandlers = createEventHandlers();

  return new EventBus<ApplicationEvent>(eventHandlers);
}

export function resolveApplicationEventBus() {
  return container.resolve<ApplicationEventBus>(Tokens.EventBus);
}
