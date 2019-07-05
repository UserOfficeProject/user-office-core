import { isRejection, Rejection } from "../rejection";

type EventHandler<T> = (event: T) => void;

export class EventBus<T extends { type: string }> {
  constructor(private handlers: EventHandler<T>[] = []) {}

  public publish(event: T) {
    for (let i = 0; i < this.handlers.length; i++) {
      const handler = this.handlers[i];
      try {
        handler(event);
      } catch (err) {
        // Something happened, log it and continue
        console.error(`Error handling ${event.type} with handler ${i}`);
      }
    }
  }

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
