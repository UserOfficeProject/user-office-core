import {
  Winston,
  WinstonLogger,
  setLogger,
} from '@user-office-software/duo-logger';

export function configureSTFCWinstonLogger() {
  setLogger(
    new WinstonLogger({
      level: 'info',
      format: Winston.format.combine(
        Winston.format.timestamp({
          format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
        }),
        Winston.format.printf((args) => {
          return `[${args.timestamp}] ${args.level.toUpperCase()} - ${args.message} \n ${JSON.stringify(args)}`;
        })
      ),
      transports: [new Winston.transports.Console()],
    })
  );
}
