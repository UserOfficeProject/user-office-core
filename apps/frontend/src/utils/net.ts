export type ValidEmailAddress = string;
export const isValidEmail = (email: unknown): email is ValidEmailAddress =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
