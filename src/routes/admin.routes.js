import { Router } from 'express'
import { loginInit, loginVerify, me } from '../controllers/admin.controller.js'
import { authAdmin } from '../middlewares/auth.js'

const router = Router()

router.post('/login/init', loginInit)
router.post('/login/verify', loginVerify)
router.get('/me', authAdmin, me)

export default router

