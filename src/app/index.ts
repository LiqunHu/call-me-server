import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import routers from '@/routes'
import logger from '@logger'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.raw({ limit: '50mb' }))
app.disable('etag')

app.use(express.static(path.join(__dirname, '../public')))
app.use('/temp', express.static(path.join(__dirname, '../../public/temp')))
app.use('/files', express.static(path.join(__dirname, '../../public/files')))

app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
    'Incoming request',
  )
  next()
})

// const secureConfig = config.get<SecureConfig>('security')
// authority.initMiddleware(simpleSelect, secureConfig)
// // app.use('/api', authority.AuthMiddleware, systemTrace)
// app.use('/api', authority.authMiddleware)

app.get('/__webpack_hmr', (req, res) => {
  res.send('')
})

for (const r of routers) {
  app.use(r.url, r.handler)
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err, 'Error')
  res.status(500).json({ error: 'Internal server error' })
})

export default app
