import winston, { format } from 'winston';

const formatter = format.printf(({ level, message, timestamp, stack }) => {
  if (stack != null) {
    return `${timestamp} ${level}: ${message}\n${stack}`;
  } else {
    return `${timestamp} ${level}: ${message}`;
  }
});

const transportOptions = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
};

const logger = winston.createLogger({
  format: format.combine(format.timestamp(), formatter),
  transports: [new winston.transports.Console(transportOptions)]
});

export default logger;
