class GrayLogLogger implements ILogger {
  log = require("gelf-pro");

  constructor(server: string, port: number, private environment: string) {
    this.log.setConfig({
      fields: {
        facility: "DMSC",
        service: "UserOfficeBackend"
      },
      adapterName: "udp",
      adapterOptions: {
        host: server,
        port: port
      }
    });
  }

  private getCommonFields(level: LEVEL, message: string, context: object) {
    return {
      level_str: LEVEL[level],
      title: message,
      environment: this.environment,
      stackTrace: new Error().stack,
      context: JSON.stringify(context)
    };
  }

  logInfo(message: string, context: object) {
    this.log.info(message, this.getCommonFields(LEVEL.INFO, message, context));
  }

  logWarn(message: string, context: object) {
    this.log.warning(
      message,
      this.getCommonFields(LEVEL.WARN, message, context)
    );
  }

  logDebug(message: string, context: object) {
    this.log.debug(
      message,
      this.getCommonFields(LEVEL.DEBUG, message, context)
    );
  }

  logError(message: string, context: object) {
    const payload = this.getCommonFields(LEVEL.ERROR, message, context);
    this.log.error(message, payload);
  }

  logException(
    message: string,
    exception: Error | string,
    context?: object
  ): void {
    if (exception !== null) {
      this.logError(message, { exception, ...context });
    } else {
      this.logError(message, context || {});
    }
  }
}

class ConsoleLogger implements ILogger {
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

  logException(
    message: string,
    exception: Error | string,
    context?: object
  ): void {
    if (exception instanceof Error) {
      this.logError(
        message,
        (() => {
          const { name, message, stack } = exception;
          return {
            exception: { name, message, stack },
            level_str: LEVEL[LEVEL.ERROR],
            ...context
          };
        })()
      );
      if (typeof exception === "string" || exception instanceof String) {
        this.logError(message, { exception, ...context });
      } else {
        this.logError(message, context || {});
      }
    }
  }

  log(level: LEVEL, message: string, context: object) {
    console.log(`${level} - ${message} \n ${JSON.stringify(context)}`);
  }
}

export class MutedLogger implements ILogger {
  logInfo(message: string, context: object): void {}
  logWarn(message: string, context: object): void {}
  logDebug(message: string, context: object): void {}
  logError(message: string, context: object): void {}
  logException(
    message: string,
    exception: Error | string,
    context?: object
  ): void {}
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
  logException(
    message: string,
    exception: Error | string,
    context?: object
  ): void;
}

class LoggerFactory {
  static logger: ILogger;
  static getLogger(): ILogger {
    if (this.logger) {
      return this.logger;
    }
    const env = process.env.NODE_ENV || "unset";
    if (env === "development") {
      this.logger = new ConsoleLogger();
      /*this.logger = new GrayLogLogger(
        process.env.GRAYLOG_SERVER!,
        parseInt(process.env.GRAYLOG_PORT!),
        process.env.NODE_ENV
      );*/
    } else {
      const server = process.env.GRAYLOG_SERVER;
      const port = parseInt(process.env.GRAYLOG_PORT || "0");
      if (server && port) {
        this.logger = new GrayLogLogger(server, port, env);
      } else {
        this.logger = new MutedLogger();
      }
    }

    return this.logger;
  }
}

const logger = LoggerFactory.getLogger();

export { logger };
