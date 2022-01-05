import { logger } from '@user-office-software/duo-logger';

import { isRejection, Rejection } from '../models/Rejection';

export type EventHandler<T> = (event: T) => Promise<void>;

export class EventBus<T extends { type: string }> {
  constructor(private handlers: EventHandler<T>[] = []) {}

  public async publish(event: T) {
    for (let i = 0; i < this.handlers.length; i++) {
      const handler = this.handlers[i];
      try {
        await handler(event);
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
