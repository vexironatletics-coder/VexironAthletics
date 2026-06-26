import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

// Only attempt pino-pretty in local dev (TTY terminal).
// On any server (Hostinger etc.) fall back to plain JSON logs
// so a missing pino-pretty package never crashes the process.
const usePretty = !isProd && process.stdout.isTTY;

let prettyTransport: object | undefined;
if (usePretty) {
  try {
    require.resolve('pino-pretty');
    prettyTransport = {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
    };
  } catch {
    // pino-pretty not installed — fall back silently
  }
}

const logger = pino({
  level: isProd ? 'info' : 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
  ...prettyTransport,
});

export default logger;
