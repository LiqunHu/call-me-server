import request from 'supertest'
import { prisma } from '@utils/DB'
import * as Authority from '@/utils/Authority'
import GLBConfig from '@/utils/GLBConfig'

jest.mock('@/utils/Authority', () => {
  const actual = jest.requireActual('@/utils/Authority')
  return {
    __esModule: true,
    ...actual,
    aesDecryptModeCBC: jest.fn(),
  }
})

import app from '@/app'

describe('auth', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('POST /api/auth/signin validates body (missing fields)', async () => {
    const res = await request(app).post('/api/auth/signin').send({})
    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('errno', 'common_03')
  })

  it('POST /api/auth/signin returns auth_03 when user not found', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      login_type: 'WEB',
      username: 'no_such_user',
      identify_code: 'dummy',
    })

    // service uses "string error code" -> HTTP 700
    expect(res.status).toBe(700)
    expect(res.body).toHaveProperty('errno', 'auth_03')
  })

  it('POST /api/auth/signin returns 200 for ADMIN login', async () => {
    jest.spyOn(prisma.common_user, 'findFirst').mockResolvedValue({
      user_id: 1,
      user_username: 'admin',
      user_phone: '',
      user_password: 'dummy_key',
      user_password_error: 0,
      user_type: GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR,
      state: GLBConfig.ENABLE,
      user_avatar: '',
      user_name: '',
      user_account: '',
      user_email: '',
      user_discord: '',
      user_telegram: '',
      user_city: '',
      created_at: new Date(),
    } as any)

    jest.spyOn(prisma, '$queryRaw').mockImplementation((async (...args: any[]) => {
      const first = args[0]
      const sql = Array.isArray(first) ? first.join('') : String(first ?? '')
      if (sql.includes('FROM') && sql.includes('tbl_common_user_group')) {
        return [{ group_id: 1, group_code: 'ADMIN' }]
      }
      return []
    }) as any)

    ;(Authority.aesDecryptModeCBC as unknown as jest.Mock).mockResolvedValue('admin')

    const res = await request(app).post('/api/auth/signin').send({
      username: 'admin',
      identify_code: 'hZ5+V98nUxf5PRjEI+k/uA==',
      login_type: 'ADMIN',
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('errno', '0')
    expect(res.body).toHaveProperty('info.Authorization')
    expect(res.body).toHaveProperty('info.username', 'admin')
  })
})

