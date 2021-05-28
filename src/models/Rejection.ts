export class Rejection {
  constructor(
    public reason: string,
    public context?: Record<string, unknown>,
    public exception?: Error
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
  context?: Record<string, unknown>
): Rejection;
export function rejection(
  reason: string,
  context?: Record<string, unknown>,
  exception?: Error
): Rejection;

export function rejection(
  reason: string,
  context?: Record<string, unknown>,
  exception?: Error
): Rejection {
  return new Rejection(reason, context, exception);
}

export function isRejection(value: any): value is Rejection {
  return value instanceof Rejection;
}
