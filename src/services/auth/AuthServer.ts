import { Request } from 'express'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { v1 as uuidV1 } from 'uuid'
import common from '@/utils/Common'
import { getExpireTime, aesDecryptModeCBC, user2token } from '@/utils/Authority'
import { prisma } from '@utils/DB'
import redisClient from '@utils/RedisClient'
import { common_userModel } from '@/prisma/models'
import GLBConfig from '@/utils/GLBConfig'
import { createLogger } from '@logger'
dayjs.extend(utc)
dayjs.extend(timezone)

const logger = createLogger(__filename)

async function signinAct(req: Request) {
  const doc = await common.docValidate(req)

  if (doc.login_type === 'WEB' || doc.login_type === 'ADMIN' || doc.login_type === 'MOBILE') {
    const user = await prisma.common_user.findFirst({
      where: {
        OR: [
          { user_phone: doc.username, state: GLBConfig.ENABLE },
          { user_username: doc.username, state: GLBConfig.ENABLE },
        ],
      },
    })

    if (!user) {
      return common.error('auth_03')
    }

    if (user.user_password_error < 0) {
      return common.error('auth_03')
    }

    const decrypted = await aesDecryptModeCBC(doc.identify_code, user.user_password)

    logger.info(decrypted)
    if (decrypted != '' && (decrypted === user.user_username || decrypted === user.user_phone)) {
      const session_token = user2token(doc.login_type, user.user_id)
      logger.info(session_token)
      const loginData = await loginInit(user, session_token, doc.login_type)
      logger.info(loginData)
      if (loginData) {
        loginData.Authorization = session_token

        await prisma.common_user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            user_password_error: 0,
            user_login_time: new Date(),
          },
        })
        return common.success(loginData)
      } else {
        await prisma.common_user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            user_password_error: user.user_password_error + 1,
          },
        })

        return common.error('auth_03')
      }
    } else {
      return common.error('auth_03')
    }
  } else {
    return common.error('auth_13')
  }
}

// async function captchaAct() {
//   const captcha = svgCaptcha.create({
//     size: 4,
//     ignoreChars: '0o1i',
//     noise: 2,
//     color: true
//   })

//   let code = captcha.text
//   if (process.env.NODE_ENV === 'dev') {
//     code = 'aaaa'
//   }

//   const key = GLBConfig.REDIS_KEYS.CAPTCHA + '_' + uuidV1().replace(/-/g, '')
//   await redisClient.set(
//     key,
//     {
//       code: code
//     },
//     'EX',
//     config.get<number>('security.CAPTCHA_TOKEN_AGE')
//   )
//   logger.debug(code)

//   return common.success({ key: key, captcha: captcha.data })
// }

// async function nowAct() {
//   return common.success({
//     unix: dayjs().unix()
//   })
// }

// async function loginSmsAct(req: Request) {
//   const doc = common.docValidate(req)

//   if (!doc.key) {
//     return common.error('auth_04')
//   }
//   if (!doc.code) {
//     return common.error('auth_04')
//   }
//   const captchaData = await redisClient.get(doc.key)
//   if (!captchaData) {
//     return common.error('auth_04')
//   }

//   if (captchaData.code.toUpperCase() !== doc.code.toUpperCase()) {
//     return common.error('auth_04')
//   }

//   let code = common.generateRandomAlphaNum(4)
//   if (process.env.NODE_ENV === 'dev') {
//     code = '1111'
//   }
//   const smsExpiredTime = config.get<number>('security.SMS_TOKEN_AGE')
//   const key = [GLBConfig.REDIS_KEYS.SMS, doc.user_phone].join('_')

//   const liveTime = await redisClient.ttl(key)
//   logger.debug(liveTime)
//   logger.debug(code)
//   if (liveTime > 0) {
//     if (smsExpiredTime - liveTime < 70) {
//       return common.error('auth_06')
//     }
//   }

//   if (process.env.NODE_ENV !== 'dev') {
//     try {
//       await alisms.sendSms({
//         PhoneNumbers: doc.user_phone,
//         SignName: '京瀚科技',
//         TemplateCode: 'SMS_175580288',
//         TemplateParam: JSON.stringify({
//           code: code
//         })
//       })
//     } catch (error) {
//       logger.error(error)
//       return common.error('auth_12')
//     }
//   }

//   await redisClient.set(
//     key,
//     {
//       code: code
//     },
//     'EX',
//     smsExpiredTime
//   )

//   return common.success()
// }

// async function signinBySmsAct(req: Request) {
//   const doc = common.docValidate(req)

//   const msgkey = [GLBConfig.REDIS_KEYS.SMS, doc.user_phone].join('_')
//   const rdsData = await redisClient.get(msgkey)

//   if (!rdsData) {
//     return common.error('auth_04')
//   } else if (doc.code !== rdsData.code) {
//     return common.error('auth_04')
//   } else {
//     let user = await common_user.findOneBy({
//       user_phone: doc.user_phone
//     })

//     if (!user) {
//       const group = await common_usergroup.findOneBy({
//         usergroup_code: 'DEFAULT'
//       })

//       if (!group) {
//         return common.error('auth_09')
//       }

//       user = await common_user
//         .create({
//           user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
//           user_username: doc.user_phone,
//           user_phone: doc.user_phone,
//           user_password: common.generateRandomAlphaNum(6),
//           user_password_error: -1
//         })
//         .save()

//       await common_user_groups
//         .create({
//           user_id: user.user_id,
//           usergroup_id: group.usergroup_id
//         })
//         .save()

//       user = await common_user.findOneBy({
//         user_id: user.user_id
//       })
//     }

//     if (user) {
//       const session_token = authority.user2token(doc.login_type, user.user_id)
//       const loginData = await loginInit(user, session_token, doc.login_type)

//       if (loginData) {
//         loginData.Authorization = session_token
//         redisClient.del(msgkey)

//         user.user_login_time = new Date()
//         await user.save()
//         return common.success(loginData)
//       } else {
//         return common.error('auth_03')
//       }
//     }
//   }
// }

// async function signinByAccountAct(req: Request) {
//   const doc = common.docValidate(req)
//   const now = dayjs().valueOf()
//   if (doc.timestamp < now - 60000 || doc.timestamp > now) {
//     return common.error('auth_11')
//   }
//   const signAddress = web3js.eth.accounts.recover(
//     `Welcome to zkPass
// By connecting your wallet and using zkPass, you agree to our Terms of Service and Privacy Policy.
// ${dayjs(doc.timestamp).tz(doc.timezone).format('HH:mm MM-DD')}`,
//     doc.signature
//   )

//   if (doc.address.toLowerCase() == signAddress.toLowerCase()) {
//     let user = await common_user.findOneBy({
//       user_account: doc.address
//     })
//     if (!user) {
//       const group = await common_usergroup.findOneBy({
//         usergroup_code: 'DEFAULT'
//       })

//       if (!group) {
//         return common.error('auth_09')
//       }

//       user = await common_user
//         .create({
//           user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
//           user_account: doc.address,
//           user_password: common.generateRandomAlphaNum(6),
//           user_password_error: -1
//         })
//         .save()

//       await common_user_groups
//         .create({
//           user_id: user.user_id,
//           usergroup_id: group.usergroup_id
//         })
//         .save()

//       user = await common_user.findOneBy({
//         user_id: user.user_id
//       })
//     }

//     if (user) {
//       const session_token = authority.user2token(doc.login_type, user.user_id)
//       const loginData = await loginInit(user, session_token, doc.login_type)

//       if (loginData) {
//         loginData.Authorization = session_token

//         user.user_login_time = new Date()
//         await user.save()
//         return common.success(loginData)
//       } else {
//         return common.error('auth_03')
//       }
//     }
//   } else {
//     return common.error('auth_03')
//   }
// }

// async function signoutAct(req: Request) {
//   const tokenData = await authority.tokenVerify(req)
//   if (typeof tokenData == 'string') {
//     return common.success()
//   }
//   if (tokenData) {
//     const type = tokenData.type,
//       user_id = tokenData.user_id
//     await redisClient.del([GLBConfig.REDIS_KEYS.AUTH, type, user_id].join('_'))
//   }
//   return common.success()
// }

// async function userExistAct(req: Request) {
//   const doc = common.docValidate(req)
//   const user = await common_user.findOne({
//     where: [
//       { user_phone: doc.user_username },
//       { user_username: doc.user_username }
//     ]
//   })
//   if (user) {
//     return common.error('auth_02')
//   } else {
//     return common.success()
//   }
// }

// async function registerSmsAct(req: Request) {
//   const doc = common.docValidate(req)
//   let msgphone = ''

//   if (!doc.key) {
//     return common.error('auth_04')
//   }
//   if (!doc.code) {
//     return common.error('auth_04')
//   }
//   const captchaData = await redisClient.get(doc.key)
//   if (!captchaData) {
//     return common.error('auth_04')
//   }

//   if (captchaData.code.toUpperCase() !== doc.code.toUpperCase()) {
//     return common.error('auth_04')
//   }

//   const phoneCheck = phone('+' + doc.country_code + doc.user_phone)
//   if (!phoneCheck.isValid) {
//     return common.error('auth_10')
//   }

//   if (phoneCheck.countryCode === 'CHN') {
//     // 中国
//     if (doc.country_code !== '86') {
//       return common.error('auth_10')
//     }
//     msgphone = doc.user_phone
//   } else {
//     return common.error('auth_10')
//   }

//   let code = common.generateRandomAlphaNum(4)
//   if (process.env.NODE_ENV === 'dev') {
//     code = '1111'
//   }
//   const smsExpiredTime = config.get<number>('security.SMS_TOKEN_AGE')
//   const key = [GLBConfig.REDIS_KEYS.SMS, msgphone].join('_')

//   const liveTime = await redisClient.ttl(key)
//   logger.debug(liveTime)
//   logger.debug(code)
//   logger.debug(msgphone)
//   if (liveTime > 0) {
//     if (smsExpiredTime - liveTime < 70) {
//       return common.error('auth_06')
//     }
//   }

//   if (process.env.NODE_ENV !== 'dev') {
//     try {
//       await alisms.sendSms({
//         PhoneNumbers: msgphone,
//         SignName: '',
//         TemplateCode: 'SMS_175580288',
//         TemplateParam: JSON.stringify({
//           code: code
//         })
//       })
//     } catch (error) {
//       logger.error(error)
//       return common.error('auth_12')
//     }
//   }

//   await redisClient.set(
//     key,
//     {
//       code: code
//     },
//     'EX',
//     smsExpiredTime
//   )

//   return common.success()
// }

// async function registerAct(req: Request) {
//   const doc = common.docValidate(req)
//   let msgphone = ''
//   let user = await common_user.findOne({
//     where: [
//       { user_phone: doc.user_phone },
//       { user_username: doc.user_username }
//     ]
//   })
//   if (user) {
//     return common.error('auth_02')
//   } else {
//     if (doc.country_code === '86') {
//       msgphone = doc.user_phone
//     } else {
//       msgphone = doc.country_code + doc.user_phone
//     }

//     const smskey = [GLBConfig.REDIS_KEYS.SMS, msgphone].join('_')
//     const rdsData = await redisClient.get(smskey)

//     if (!rdsData) {
//       return common.error('auth_04')
//     } else if (doc.code != rdsData.code) {
//       return common.error('auth_04')
//     } else {
//       await redisClient.del(smskey)
//       const group = await common_usergroup.findOneBy({
//         usergroup_code: 'DEFAULT'
//       })

//       if (!group) {
//         return common.error('auth_09')
//       }

//       user = await common_user
//         .create({
//           user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
//           user_username: doc.user_username,
//           user_country_code: doc.country_code,
//           user_phone: doc.user_phone,
//           user_password: doc.user_password,
//           user_name: doc.user_name || ''
//         })
//         .save()

//       await common_user_groups
//         .create({
//           user_id: user.user_id,
//           usergroup_id: group.usergroup_id
//         })
//         .save()

//       // login
//       user = await common_user.findOneBy({
//         user_id: user.user_id
//       })
//       if (!user) {
//         return common.error('auth_02')
//       }
//       const session_token = authority.user2token('WEB', user.user_id)
//       const loginData = await loginInit(user, session_token, 'WEB')
//       if (loginData) {
//         loginData.Authorization = session_token
//         return common.success(loginData)
//       } else {
//         return common.error('auth_03')
//       }
//     }
//   }
// }

async function loginInit(user: common_userModel, session_token: string, type: string) {
  try {
    const returnData = Object.create(null)
    returnData.avatar = user.user_avatar
    returnData.user_id = user.user_id
    returnData.username = user.user_username
    returnData.name = user.user_name
    returnData.phone = user.user_phone
    returnData.address = user.user_account
    returnData.user_email = user.user_email
    returnData.user_discord = user.user_discord
    returnData.user_telegram = user.user_telegram
    returnData.created_at = dayjs(user.created_at).format('YYYYMMDD')
    returnData.city = user.user_city
    returnData.password_state = user.user_password_error

    const groups = await prisma.$queryRaw<{ group_id: number; group_code: string }[]>`SELECT
      a.group_id,
      b.group_code
    FROM
      tbl_common_user_group a
      LEFT JOIN tbl_common_group b ON a.group_id = b.group_id
    WHERE
      a.user_id = ${user.user_id}`

    if (groups.length > 0) {
      const gids: number[] = []
      returnData.groups = []
      for (const g of groups) {
        gids.push(g.group_id)
        returnData.groups.push(g.group_code)
      }

      returnData.menulist = await iterationMenu(user, gids)

      // prepare redis Cache
      const authApis = []
      authApis.push({
        api_name: 'User settings',
        api_function: 'USERSETTING',
        auth_flag: '1',
      })
      if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
        if (user.user_username === 'admin') {
          authApis.push({
            api_name: 'Menu maintenance',
            api_function: 'SYSTEMAPICONTROL',
          })

          authApis.push({
            api_name: 'Role maintenance',
            api_function: 'GROUPCONTROL',
          })

          authApis.push({
            api_name: 'User maintenance',
            api_function: 'OPERATORCONTROL',
          })

          authApis.push({
            api_name: 'Base',
            api_function: 'BASECONTROL',
          })

          authApis.push({
            api_name: 'Reset password',
            api_function: 'RESETPASSWORD',
          })
        } else {
          authApis.push({
            api_name: 'Organizational maintenance',
            api_function: 'ORGANIZATIONGROUPCONTROL',
          })

          authApis.push({
            api_name: 'Institutional user maintenance',
            api_function: 'ORGANIZATIONUSERCONTROL',
          })

          authApis.push({
            api_name: 'Base',
            api_function: 'BASECONTROL',
          })
        }
      } else {
        const groupapis = await queryGroupApi(gids)
        for (const item of groupapis) {
          authApis.push({
            api_name: item.api_name,
            api_function: item.api_function,
            auth_flag: item.auth_flag,
          })
        }
      }
      returnData.authApis = authApis

      const userData = JSON.parse(JSON.stringify(user))
      delete userData.user_password
      userData.groups = JSON.parse(JSON.stringify(returnData.groups))

      const loginKey = [GLBConfig.REDIS_KEYS.AUTH, type, user.user_id].join('_')
      await redisClient.del(loginKey)
      if (type === 'API') {
        redisClient.set(loginKey, {
          session_token: session_token,
          user: userData,
          authApis: authApis,
        })
        return returnData
      } else {
        await redisClient.setExpiry(
          loginKey,
          {
            session_token: session_token,
            user: userData,
            authApis: authApis,
          },
          'EX',
          getExpireTime(),
        )
      }

      return returnData
    } else {
      throw new Error('UserNotInGroup')
    }
  } catch (error) {
    throw error
  }
}

const queryGroupApi = async (groups: number[]) => {
  try {
    const groupmenus = await prisma.$queryRaw<{ api_name: string; api_function: string; auth_flag: string }[]>`SELECT DISTINCT
        c.api_name ,
        c.api_function ,
        c.auth_flag
      FROM
        tbl_common_usergroupmenu a ,
        tbl_common_systemmenu b ,
        tbl_common_api c ,
        tbl_common_usergroup d
      WHERE
        a.menu_id = b.systemmenu_id
      AND b.api_id = c.api_id
      AND a.usergroup_id = d.usergroup_id
      AND d.organization_id = 0
      AND(c.api_type = '0' OR c.api_type = '2')
      AND c.api_function != ''
      AND a.usergroup_id = ANY(${groups})
      AND b.state = '1'
      UNION
        SELECT DISTINCT
          c.api_name ,
          c.api_function ,
          c.auth_flag
        FROM
          tbl_common_usergroupmenu a ,
          tbl_common_organizationmenu b ,
          tbl_common_api c ,
          tbl_common_usergroup d
        WHERE
          a.menu_id = b.organizationmenu_id
        AND b.api_id = c.api_id
        AND a.usergroup_id = d.usergroup_id
        AND d.organization_id != 0
        AND(c.api_type = '0' OR c.api_type = '2')
        AND c.api_function != ''
        AND a.usergroup_id = ANY(${groups})
        AND b.state = '1'`
    return groupmenus
  } catch (error) {
    logger.error(error)
    return []
  }
}

interface menuItem {
  menu_id?: number
  menu_type: string
  menu_name: string
  menu_path?: string
  menu_icon?: string
  show_flag?: string
  sub_menu?: menuItem[]
}
async function iterationMenu(user: common_userModel, groups: number[]): Promise<menuItem[]> {
  if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
    const return_list: menuItem[] = []
    const rootMenu: menuItem = {
      menu_id: 0,
      menu_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      menu_name: 'System Management',
      menu_icon: 'fa-cogs',
      sub_menu: [],
    }
    return_list.push(rootMenu)
    if (user.user_username === 'admin') {
      rootMenu.sub_menu!.push({
        menu_id: 1,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'Menu maintenance',
        menu_path: '/system/auth/SystemApiControl',
      })

      rootMenu.sub_menu!.push({
        menu_id: 2,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'Role maintenance',
        menu_path: '/system/auth/GroupControl',
      })

      rootMenu.sub_menu!.push({
        menu_id: 3,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'User maintenance',
        menu_path: '/system/auth/OperatorControl',
      })

      rootMenu.sub_menu!.push({
        menu_id: 6,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'Reset password',
        menu_path: '/system/auth/ResetPassword',
      })
    } else {
      rootMenu.sub_menu!.push({
        menu_id: 7,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'Organizational maintenance',
        menu_path: '/system/auth/OrganizationGroupControl',
      })

      rootMenu.sub_menu!.push({
        menu_id: 8,
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: 'Institutional user maintenance',
        menu_path: '/system/auth/OrganizationUserControl',
      })
    }

    return return_list
  } else {
    return await recursionMenu(groups, '0')
  }
}

async function recursionMenu(groups: number[], parent_id: string | number): Promise<menuItem[]> {
  const return_list: menuItem[] = []
  const menus = await prisma.$queryRaw<
    { menu_id: number; node_type: string; menu_name: string; menu_icon: string; api_path: string }[]
  >`SELECT DISTINCT
        b.systemmenu_id menu_id ,
        b.node_type ,
        b.systemmenu_name menu_name ,
        b.systemmenu_icon menu_icon ,
        c.api_path
      FROM
        tbl_common_usergroupmenu a ,
        tbl_common_systemmenu b
      LEFT JOIN tbl_common_api c ON b.api_id = c.api_id
      AND(c.api_type = '0' OR c.api_type = '1')
      AND api_path != ''
      WHERE
        a.menu_id = b.systemmenu_id
      AND a.usergroup_id = ANY(${groups})
      AND b.parent_id = ${parent_id}`

  for (const m of menus) {
    let sub_menu: menuItem[] = []

    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menu = await recursionMenu(groups, m.menu_id)
    }

    if (m.node_type === GLBConfig.NODE_TYPE.NODE_LEAF && m.api_path) {
      return_list.push({
        menu_id: m.menu_id,
        menu_type: m.node_type,
        menu_name: m.menu_name,
        menu_path: m.api_path,
        menu_icon: m.menu_icon,
      })
    } else if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT && sub_menu.length > 0) {
      return_list.push({
        menu_id: m.menu_id,
        menu_type: m.node_type,
        menu_name: m.menu_name,
        menu_path: m.api_path,
        menu_icon: m.menu_icon,
        sub_menu: sub_menu,
      })
    }
  }
  return return_list
}

export default {
  signinAct,
  loginInit,
  // captchaAct,
  // nowAct,
  // loginSmsAct,
  // signinBySmsAct,
  // signinByAccountAct,
  // signoutAct,
  // userExistAct,
  // registerSmsAct,
  // registerAct,
}
