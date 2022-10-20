import { createLogger, format, transports } from 'winston';

// Define logging formats
const fileLogFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.json(),
  format.prettyPrint()
);

const consoleLogFormat = format.combine(
  format.colorize(), // has to be called first
  format.simple()
);

// Set up the logger
export const logger = createLogger({
  level: 'info',
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
  ]
});

// Additionally log to the console, if not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: consoleLogFormat
    })
  );
}
