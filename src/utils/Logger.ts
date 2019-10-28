export class Logger implements ILogger {
  logInfo(message: string, context: object) {
    this.log(LEVEL.INFO, message, context);
  }

  logWarn(message: string, context: object) {
    this.log(LEVEL.WARN, message, context);
  }

  logDebug(message: string, context: object) {
    this.log(LEVEL.DEBUG, message, context);
  }

  logError(message: string, context: object) {
    this.log(LEVEL.ERROR, message, context);
  }

  logException(message: string, exception: Error, context?: object): void {
    this.log(
      LEVEL.EXCEPTION,
      message,
      (() => {
        const { name, message, stack } = exception;
        return { exception: { name, message, stack }, ...context };
      })()
    );
  }

  log(level: LEVEL, message: string, context: object) {
    console.log(`${level} - ${message} \n ${JSON.stringify(context)}`);
  }
}

export class DummyLogger implements ILogger {
  logInfo(message: string, context: object): void {}
  logWarn(message: string, context: object): void {}
  logDebug(message: string, context: object): void {}
  logError(message: string, context: object): void {}
  logException(message: string, exception: Error, context?: object): void {}
  log(level: LEVEL, message: string, context: object): void {}
}

export enum LEVEL {
  INFO = "INFO",
  DEBUG = "DEBUG",
  WARN = "WARN",
  ERROR = "ERROR",
  EXCEPTION = "EXCEPTION",
  FATAL = "FATAL"
}

export interface ILogger {
  logInfo(message: string, context: object): void;
  logWarn(message: string, context: object): void;
  logDebug(message: string, context: object): void;
  logError(message: string, context: object): void;
  logException(message: string, exception: Error, context?: object): void;
  log(level: LEVEL, message: string, context: object): void;
}
