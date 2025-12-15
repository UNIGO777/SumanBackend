import { Router } from 'express'
import { sendBasic, contact } from '../controllers/mail.controller.js'

const router = Router()

router.post('/send', sendBasic)
router.post('/contact', contact)

export default router

