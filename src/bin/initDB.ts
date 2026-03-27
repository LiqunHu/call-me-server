import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: pool })

const apiData: Prisma.common_apiCreateInput[] = [
  {
    api_type: '0',
    api_name: '系统菜单维护',
    api_path: '/admin/auth/SystemApiControl',
    api_function: 'SYSTEMAPICONTROL',
    auth_flag: '1',
  },
  {
    api_type: '0',
    api_name: '角色设置',
    api_path: '/admin/auth/GroupControl',
    api_function: 'GROUPCONTROL',
    auth_flag: '1',
  },
  {
    api_type: '0',
    api_name: '用户维护',
    api_path: '/admin/auth/OperatorControl',
    api_function: 'OPERATORCONTROL',
    auth_flag: '1',
  },
  {
    api_type: '0',
    api_name: '重置密码',
    api_path: '/admin/auth/ResetPassword',
    api_function: 'RESETPASSWORD',
    auth_flag: '1',
  },
  {
    api_type: '2',
    api_name: '用户设置',
    api_path: '/admin/user/UserSetting',
    api_function: 'USERSETTING',
    auth_flag: '1',
  },
]

async function main() {
  for (const a of apiData) {
    const api = await prisma.common_api.create({
      data: a,
    })
    console.log(`Created api with id: ${api.api_id}`)
  }

  const defaultGroup = await prisma.common_group.create({
    data: {
      group_type: '00',
      group_code: 'DEFAULT',
      group_name: 'Default',
      node_type: '01',
      parent_id: '0',
    },
  })

  const admin = await prisma.common_user.create({
    data: {
      user_username: 'admin',
      user_type: '01',
      user_password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      user_name: 'admin',
    },
  })

  await prisma.common_user_group.create({
    data: {
      user_id: admin.user_id,
      group_id: defaultGroup.group_id,
    },
  })

  console.log('Database initialized successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
