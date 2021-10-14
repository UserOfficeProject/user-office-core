export class Rejection {
  constructor(
    public reason: string,
    public context?: Record<string, unknown>,
    public exception?: Error | unknown
  ) {}

  get contextStr() {
    return JSON.stringify(this.context);
  }

  get exceptionStr() {
    return JSON.stringify(this.exception);
  }
}

export function rejection(
  reason: string,
  context?: Record<string, unknown>,
  exception?: Error | unknown
): Rejection {
  return new Rejection(reason, context, exception);
}

export function isRejection(value: any): value is Rejection {
  return value instanceof Rejection;
}
