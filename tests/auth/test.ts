import request from 'supertest'
import app from '@/app'

describe('auth', () => {
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
})

