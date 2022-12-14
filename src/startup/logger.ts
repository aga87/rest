import { createLogger, format, transports, Logger } from 'winston';

// Define logging formats
const fileLogFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.json(),
  format.prettyPrint()
);

const consoleLogFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.colorize(), // has to be called first
  format.simple(),
  format.printf((msg) => {
    return `[LOGGER] ${msg.timestamp} ${msg.level} ${msg.message}`;
  })
);

// Set up the logger
export const logger: Logger = createLogger({
  level: 'http',
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileLogFormat
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: fileLogFormat
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.File({
      filename: 'logs/uncaughtExceptions.log',
      format: fileLogFormat
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: fileLogFormat
    })
  ],
  // Handle uncaught promise rejections
  rejectionHandlers: [
    new transports.File({
      filename: 'logs/unhandledRejections.log',
      format: fileLogFormat
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: fileLogFormat
    })
  ]
});

// Additionally log to the console, if not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: consoleLogFormat
    })
  );
  // Handle uncaught exceptions
  logger.exceptions.handle(new transports.Console());
  // Handle uncaught promise rejections
  logger.rejections.handle(new transports.Console());
}
