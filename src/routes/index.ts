import admin from './admin'
import auth from './auth'
import health from './health'

export default [
  { url: '/api/auth', handler: auth },
  { url: '/api/admin', handler: admin },
  { url: '/health', handler: health },
]
