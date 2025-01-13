import { Global, Module, Provider } from '@nestjs/common';
import winston from 'winston';

// Check node environment
const environment = process.env.APP_ENV || 'local';
const isDevelopment = environment === 'local';

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  return isDevelopment ? 'debug' : 'info';
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: isDevelopment }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.splat(),
  winston.format.printf(
    (log) => `${log.timestamp} ${log.level}: ${log.message}`,
  ),
  // Add stack trace for errors
  winston.format.errors({ stack: true }),
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports: any[] = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
];

const loggerProvider: Provider = {
  provide: 'LOGGER',
  useFactory: () => {
    return winston.createLogger({
      level: level(),
      levels,
      format,
      transports,
    });
  },
};

@Global()
@Module({
  providers: [loggerProvider],
  exports: [loggerProvider],
})
export class LoggerModule {}
