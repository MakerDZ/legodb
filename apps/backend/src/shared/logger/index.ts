import pino from 'pino';
import winston from 'winston';
import path from 'path';

// Define the path for log files
const logFilePath = path.join(__dirname, '../../../logs');

// Configure Winston for file logging
const fileLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logFilePath, 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logFilePath, 'combined.log'),
        }),
    ],
});

// Configure Pino for console logging
const pinoLogger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    },
});

// Store original logging methods
const originalPinoLogger = {
    error: pinoLogger.error.bind(pinoLogger),
    warn: pinoLogger.warn.bind(pinoLogger),
    info: pinoLogger.info.bind(pinoLogger),
    debug: pinoLogger.debug.bind(pinoLogger),
    fatal: pinoLogger.fatal.bind(pinoLogger),
    trace: pinoLogger.trace.bind(pinoLogger),
};

// Custom logger that logs to both Pino and Winston
const logger: pino.Logger = Object.assign(pinoLogger, {
    error(message: string, ...args: unknown[]): void {
        originalPinoLogger.error(message, ...args);
        fileLogger.error(message, ...args);
    },
    warn(message: string, ...args: unknown[]): void {
        originalPinoLogger.warn(message, ...args);
        fileLogger.warn(message, ...args);
    },
    info(message: string, ...args: unknown[]): void {
        originalPinoLogger.info(message, ...args);
        fileLogger.info(message, ...args);
    },
    debug(message: string, ...args: unknown[]): void {
        originalPinoLogger.debug(message, ...args);
        fileLogger.debug(message, ...args);
    },
    fatal(message: string, ...args: unknown[]): void {
        originalPinoLogger.fatal(message, ...args);
        fileLogger.error(message, ...args); // Winston does not have a 'fatal' level by default
    },
    trace(message: string, ...args: unknown[]): void {
        originalPinoLogger.trace(message, ...args);
        fileLogger.debug(message, ...args); // Adjust if you have a specific 'trace' level in your file logger
    },
    child(bindings: pino.Bindings): pino.Logger {
        return logger; // If you want actual child loggers, you should create them appropriately based on the bindings
    },
});

export default logger;
