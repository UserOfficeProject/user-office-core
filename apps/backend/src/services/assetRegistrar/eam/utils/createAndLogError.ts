import { logger } from '@user-office-software/duo-logger';
export function createAndLogError(
  message: string,
  context: Record<string, unknown>
) {
  logger.logError(message, context);

  return new Error(message);
}
