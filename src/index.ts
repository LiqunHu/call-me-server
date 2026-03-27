#!/usr/bin/env node
import 'dotenv/config'
import http from 'http'
// 设置logger
import app from './app'

import redisClient from '@utils/RedisClient'
import { initDB, closeDB } from '@utils/DB'

let port = 9091

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val: string): number => {
  let port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return parseInt(val)
  }

  if (port >= 0) {
    // port number
    return port
  }

  return 0
}

/**
 * Get port from environment and store in Express.
 */

port = normalizePort(process.env.PORT!) || port
app.set('port', port)

/**
 * Create HTTP server.
 */

let server = http.createServer(app)

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = async () => {
  console.log('services running on port ' + port)
  let addr = server.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
  console.log('Listening on ' + bind)

  console.log('Initializing Redis client...')
  await redisClient.initClient(process.env.REDIS_URL || '')
  console.log('Redis client initialized successfully')

  console.log('Initializing database connection...')
  await initDB(process.env.DATABASE_URL || '')
  console.log('Database connection initialized successfully')
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, onListening)
server.on('error', onError)

const gracefulShutdown = (signal: string) => {
  console.log(`\n📡 Received ${signal}. Shutting down gracefully...`)
  server.close(async (err) => {
    if (err) {
      console.error('❌ Error during server close:', err)
      process.exit(1)
    }
    closeDB()
    redisClient.quit()
    console.log('HTTP server closed')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('⏰ Forced shutdown after timeout')
    process.exit(1) // Exit with error code to indicate an issue
  }, 10000) // 10 seconds timeout
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
