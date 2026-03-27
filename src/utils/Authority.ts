import { webcrypto } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { sign, verify } from 'jsonwebtoken'
import { createLogger } from '@logger'
import redisClient from '@utils/RedisClient'

const logger = createLogger(__filename)

export function getExpireTime(): number {
  return parseInt(process.env.TOKEN_AGE || '0') || 43200
}


export function user2token(type: string, userId: string): string {
  try {
    if (type === 'API') {
      return sign({ type: type, user_id: userId }, process.env.SECRET_KEY || '')
    } else {
      return sign({ type: type, user_id: userId }, process.env.SECRET_KEY || '', {
        expiresIn: getExpireTime(),
      })
    }
  } catch (error) {
    logger.error(error)
    return ''
  }
}

export interface DataStoredInToken {
  type: string
  user_id: string
  exp?: number
  token?: string
}

export async function tokenVerify(req: Request): Promise<DataStoredInToken> {
  let token_str = req.cookies['Authorization'] || req.header('Authorization')
  if (!token_str) {
    logger.error('no token')
    throw new Error('NoTokenProvided')
  }

  try {
    let tokenData = (await verify(token_str, process.env.SECRET_KEY || '')) as DataStoredInToken

    if (typeof tokenData.exp === 'number') {
      if (tokenData.exp < Date.now() / 1000) {
        logger.debug('token expired')
        throw new Error('TokenExpiredError')
      }
    }
    tokenData.token = token_str
    return tokenData
  } catch (error) {
    logger.error(error)
    if (error instanceof Error) {
      if (error.name == 'TokenExpiredError') {
        throw new Error('TokenExpiredError')
      }
    }
    throw new Error('TokenVerificationFailed')
  }
}

async function token2user(req: Request) {
  try {
    let tokenData = await tokenVerify(req)

    let authData = await redisClient.get(['AUTH', tokenData.type, tokenData.user_id].join('_'))
    if (authData) {
      let user = authData.user
      if (!user) {
        throw new Error('UserNotExist')
      }
      req.user = user

      if (authData.session_token != tokenData.token) {
        throw new Error('LoginFromOtherPlace')
      }

      let paths = req.path.split('/') || []
      let method = paths.at(paths.length - 2)?.toUpperCase()
      if (typeof method === 'string') {
        // if (
        //   config.syslogFlag &&
        //   func !== 'AUTH' &&
        //   method !== 'init' &&
        //   method !== 'search' &&
        //   method.search(/search/i) < 0
        // ) {
        //   tb_common_userlog.create({
        //     user_id: user.user_id,
        //     api_function: func,
        //     userlog_method: method,
        //     userlog_para: JSON.stringify(req.body)
        //   })
        // }

        let apiList = authData.authApis

        //auth control
        let apis: { [key: string]: any } = {}
        for (let m of apiList) {
          apis[m.api_function] = ''
        }

        if (method in apis) {
          return
        }
      }
    } else {
      throw new Error('AuthDataNotExist')
    }

    throw new Error('Unauthorized')
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export async function aesDecryptModeCBC(msg: string, pwd: string): Promise<string> {
  try {
    let encrypted = Buffer.from(msg, 'base64')

    let key = Buffer.from(pwd, 'hex')

    let iv = new Uint8Array(16)
    iv[0] = 1

    const key_encoded = await webcrypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt'])

    const decrypted = await webcrypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv,
      },
      key_encoded,
      encrypted,
    )
    const dec = new TextDecoder('utf-8')
    return dec.decode(decrypted)
  } catch (error) {
    return ''
  }
}

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.method === 'POST') {
      let apis = await redisClient.get('AUTHAPI')
      if (apis === null) {
        let apiList = await dbh(`select api_function, auth_flag from tbl_common_api where state = '1' and api_function != ''`, [])

        for (let a of apiList) {
          apis[a.api_function] = a.auth_flag
        }
      }

      let patha = req.path.split('/')
      let func = patha[patha.length - 2].toUpperCase()

      let checkresult = await security.token2user(req)

      if (func in apis) {
        if (apis[func] === '1') {
          if (checkresult != 0) {
            if (checkresult === -2) {
              logger.info('UNAUTHORIZED')
              return res.status(401).send({
                errno: -2,
                msg: 'Login from other place',
              })
            } else {
              logger.info('UNAUTHORIZED')
              return res.status(401).send({
                errno: -1,
                msg: 'Auth Failed or session expired',
              })
            }
          }
        } else {
          if (checkresult === -2) {
            return res.status(401).send({
              errno: -2,
              msg: 'Login from other place',
            })
          } else if (checkresult === -3) {
            return res.status(401).send({
              errno: -1,
              msg: 'Auth Failed or session expired',
            })
          }
        }
      } else {
        if (func != 'AUTH') {
          logger.info('UNAUTHORIZED')
          return res.status(401).send({
            errno: -1,
            msg: 'Auth Failed or session expired',
          })
        }
      }
    }
  } catch (error: any) {
    let sendData = {}
    if (process.env.NODE_ENV === 'dev') {
      sendData = {
        errno: -1,
        msg: error.stack,
      }
    } else {
      sendData = {
        errno: -1,
        msg: 'Internal Error',
      }
    }
    return res.status(500).send(sendData)
  }
  next()
}
