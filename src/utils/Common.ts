import fs from 'fs'
import Joi from 'joi'
import { Request, Response } from 'express'
import { createLogger } from '@/utils/Logger'
import Error from './Error'

const logger = createLogger(__filename)

function isEmpty(o: object): boolean {
  if (Object.keys(o).length > 0) {
    return true
  } else {
    return false
  }
}

function docValidate(req: Request) {
  const doc = req.body
  return doc
}

async function reqTrans(req: Request, callFile: string) {
  const method = req.params.method as string
  const doc = req.body
  const validatorFile = callFile.substring(0, callFile.length - 3) + '.validator' + callFile.substring(callFile.length - 3, callFile.length)
  if (fs.existsSync(validatorFile)) {
    const validator = await import(validatorFile)
    if (validator.default?.apiList && Object.prototype.hasOwnProperty.call(validator.default.apiList, method)) {
      const reqJoiSchema = validator.default.apiList[method].JoiSchema
      if (reqJoiSchema.body && !isEmpty(doc)) {
        const schema = Joi.object(reqJoiSchema.body)
        await schema.validateAsync(doc)
      }
    }
  }

  return method
}

// common response
function success(data?: any) {
  if (data) {
    return data
  } else {
    return {}
  }
}

function error(errcode?: string) {
  if (typeof errcode === 'string') {
    return errcode
  } else {
    return 'common_02'
  }
}

function sendData(res: Response, data: string | object) {
  let sendData
  if (typeof data === 'string') {
    if (data in Error) {
      sendData = {
        errno: data,
        msg: Error[data],
      }
    } else {
      sendData = {
        errno: data,
        msg: 'Unknown',
      }
    }
    res.status(700).send(sendData)
  } else {
    res.status(200).send({
      errno: '0',
      msg: 'ok',
      info: data,
    })
  }
}

function sendFault(res: any, msg: any) {
  let sendData = {}
  logger.error(msg.stack)

  if (process.env.NODE_ENV === 'test') {
    sendData = {
      errno: -1,
      msg: msg.stack,
    }
  } else {
    if (msg.name === 'ValidationError') {
      sendData = {
        errno: -3,
        msg: msg.stack,
      }
    } else {
      sendData = {
        errno: -1,
        msg: 'Internal Error',
      }
    }
  }
  res.status(500).send(sendData)
}
function generateRandomAlphaNum(len: number) {
  const charSet = '0123456789'
  let randomString = ''
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}

function generateNonceString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const maxPos = chars.length
  let noceStr = ''
  for (let i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return noceStr
}

// async function fileSaveTemp(req: Request) {
//   const tempDir = path.join(process.cwd(), config.get<string>('files.tempDir'))
//   const fileInfo = await fileUtil.fileSaveLocal(
//     req,
//     tempDir,
//     config.get<string>('files.tempUrl')
//   )
//   return fileInfo
// }
// const getUploadTempPath = uploadurl => {
//   let fileName = path.basename(uploadurl)
//   return path.join(__dirname, '../' + config.uploadOptions.uploadDir + '/' + fileName)
// }

// const fileSave = async (req, bucket) => {
//   if (config.fileSys.type === 'local') {
//     let relPath = 'upload/' + moment().format('YYYY/MM/DD/')
//     let svPath = path.join(process.cwd(), config.fileSys.filesDir, relPath)
//     let fileInfo = await fileUtil.fileSaveLocal(req, svPath, config.fileSys.urlBaseu + relPath)
//     return fileInfo
//   } else if (config.fileSys.type === 'qiniu') {
//     if (config.fileSys.bucket[bucket]) {
//       let tempDir = path.join(process.cwd(), config.fileSys.filesDir)
//       let fileInfo = await fileUtil.fileSaveQiniu(req, tempDir, bucket, config.fileSys.bucket[bucket].domain)
//       return fileInfo
//     } else {
//       throw ('bucket do not exist')
//     }
//   } else if (config.fileSys.type === 'mongo') {
//     if (config.fileSys.bucket[bucket]) {
//       let tempDir = path.join(process.cwd(), config.fileSys.filesDir)
//       let fileInfo = await fileUtil.fileSaveMongo(req, tempDir, bucket, config.fileSys.bucket[bucket].baseUrl)
//       return fileInfo
//     } else {
//       throw ('bucket do not exist')
//     }
//   } else if (config.fileSys.type === 'qiniuweb') {
//     if (config.fileSys.bucket[bucket]) {
//       return {
//         action: config.fileSys.bucket[bucket].action,
//         domain: config.fileSys.bucket[bucket].domain,
//         token: fileUtil.FileSaveQiniuToken(bucket)
//       }
//     } else {
//       throw ('bucket do not exist')
//     }
//   }
// }

export default {
  isEmpty,
  docValidate,
  reqTrans,
  success,
  error,
  sendData,
  sendFault,
  generateRandomAlphaNum,
  generateNonceString,
}
