import Joi from 'joi'

export default {
  name: 'UserSetting Services',
  apiList: {
    init: {
      name: 'changePassword',
      enname: 'UserSettingchangePassword',
      tags: ['SystemAuthControl'],
      path: '/api/admin/user/UserSetting/changePassword',
      type: 'post',
      JoiSchema: {
        body: {
          old_password: Joi.string(),
          password: Joi.string()
        }
      }
    }
  }
}
