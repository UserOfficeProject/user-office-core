import { logger } from '@user-office-software/duo-logger';

import createLoggingHandler from '../eventHandlers/logging';
import { isRejection, Rejection } from '../models/Rejection';
import { generateUniqueId } from '../utils/helperFunctions';
import { ApplicationEvent, EventStatus } from './applicationEvents';

export type EventCallback = (status: EventStatus, message: string) => void;
export type EventHandler<T> = (
  event: T,
  eventHandlerCallBack: EventCallback
) => Promise<void>;

export class EventBus<T extends { type: string; handler?: string }> {
  constructor(
    private handlers: Promise<EventHandler<T>>[] | EventHandler<T>[] = [],
    private loggingHandler = createLoggingHandler()
  ) {}

  public async publish(event: T) {
    const timestamp = Date.now();
    const uniqueEventWithId: T = {
      eventId: `${timestamp}-${generateUniqueId()}`,
      ...event,
      description: '',
      eventStatus: EventStatus.SUCCESSFUL,
    };
    for (let i = 0; i < this.handlers.length; i++) {
      const handler = await this.handlers[i];
      const event = { ...uniqueEventWithId, handler: handler.name };
      try {
        await handler(
          event,
          (eventStatus: EventStatus, description: string) => {
            this.loggingHandler({
              ...event,
              eventStatus,
              description,
            } as unknown as ApplicationEvent).catch((error) => {
              logger.logException(
                `Error handling ${event.type} with handler ${this.loggingHandler.name}`,
                error
              );
            });
          }
        );
      } catch (err) {
        // Something happened, log it and continue
        logger.logException(
          `Error handling ${event.type} with handler ${i}`,
          err
        );
      }
    }
  }

  // TODO: it is not used at all, investigate if we need this
  public async wrap<V>(
    inner: () => Promise<V | Rejection>,
    formEvent: (result: V) => T
  ): Promise<V | Rejection> {
    const result = await inner();
    if (!isRejection(result)) {
      const event = formEvent(result);
      this.publish(event);
    }

    return result;
  }
}
