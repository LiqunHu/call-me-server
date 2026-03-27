import express from 'express'
import GroupControl from '@services/admin/GroupControl'
import UserControl from '@services/admin/UserControl'
import ResetPasswordControl from '@services/admin/ResetPasswordControl'
import SystemApiControl from '@services/admin/SystemApiControl'
import UserSettingControl from '@services/admin/UserSettingControl'

const router = express.Router()

router.post('/GroupControl/:method', GroupControl)
router.post('/UserControl/:method', UserControl)
router.post('/ResetPassword/:method', ResetPasswordControl)
router.post('/SystemApiControl/:method', SystemApiControl)
router.post('/UserSetting/:method', UserSettingControl)

export default router
