import pino from 'pino'

const transport = pino.transport({
  target: 'pino/file',
  options: { destination: process.env.LOG_FILE || './logs/app.log' },
})

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  transport,
)

export const createLogger = (name: string) => {
  return logger.child({ name })
}
export default logger
