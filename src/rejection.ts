const REJECTION = Symbol("REJECTION");

export interface Rejection {
  [REJECTION]: true,
  type: string;
}

export function rejection(type: string): Rejection {
  return { [REJECTION]: true, type };
}

export function isRejection(value: any): value is Rejection {
  return REJECTION in Object(value);
}
