import {
  Winston,
  WinstonLogger,
  setLogger,
} from '@user-office-software/duo-logger';

function maskToken(token: string): string {
  const visibleChars = 6;
  if (token.length <= visibleChars) return '*'.repeat(token.length);
  const maskedPart = '*'.repeat(token.length - visibleChars);

  return maskedPart + token.slice(-visibleChars);
}

function maskSensitiveFields(
  obj: any,
  keysToMask = ['token', 'externalToken']
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveFields(item, keysToMask));
  } else if (obj && typeof obj === 'object') {
    const masked: any = {};
    for (const key of Object.keys(obj)) {
      if (keysToMask.includes(key) && typeof obj[key] === 'string') {
        masked[key] = maskToken(obj[key]);
      } else {
        masked[key] = maskSensitiveFields(obj[key], keysToMask);
      }
    }

    return masked;
  }

  return obj;
}

export function configureSTFCWinstonLogger() {
  setLogger(
    new WinstonLogger({
      level: 'info',
      format: Winston.format.combine(
        Winston.format.timestamp({
          format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
        }),
        Winston.format.printf((args) => {
          const maskedArgs = maskSensitiveFields({ ...args });

          return `[${maskedArgs.timestamp}] ${maskedArgs.level.toUpperCase()} - ${maskedArgs.message} \n ${JSON.stringify(maskedArgs)}`;
        })
      ),
      transports: [new Winston.transports.Console()],
    })
  );
}
