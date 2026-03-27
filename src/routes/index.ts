import admin from './admin'
import auth from './auth'
import test from './test'

export default [
  { url: '/api/auth', handler: auth },
  { url: '/api/admin', handler: admin },
  { url: '/api/test', handler: test },
]
