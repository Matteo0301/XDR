import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file';

const silent = (process.env.SILENT || "false").toLowerCase() === 'false'

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'green',
    debug: 'magenta',
}

winston.addColors(colors)

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
)

const logDir = './'
const transports = [
    new winston.transports.Console({
        silent: silent
    }),
    new winston.transports.File({
        filename: logDir + 'errors/error.log',
        level: 'error',
    }),
    new DailyRotateFile({
        filename: logDir + 'logs/%DATE%.log',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '100d',
        createSymlink: true,
    }),
]

const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
})

export default Logger