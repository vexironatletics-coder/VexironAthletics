import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = pino(
  isProd
    ? {
        level: 'info',
        // In production write structured JSON — fast, parseable by log aggregators
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
);

export default logger;
