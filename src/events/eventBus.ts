type EventHandler<T> = (event: T) => void;

export class EventBus<T extends { type: string }> {
  private handlers: EventHandler<T>[] = [];

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

  public addHandler(handler: EventHandler<T>) {
    this.handlers.push(handler);
  }

  public async wrap<V>(
    inner: () => Promise<V | null>,
    after: (result: V) => T
  ): Promise<V | null> {
    const result = await inner();
    if (result) {
      const event = after(result);
      this.publish(event);
    }
    return result;
  }
}
