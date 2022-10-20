import { createLogger, format, transports } from 'winston';

// Define logging formats
const fileLogFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.json(),
  format.prettyPrint()
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
