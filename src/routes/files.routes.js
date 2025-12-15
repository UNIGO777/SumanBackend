import { Router } from 'express'
import { uploadImage } from '../middlewares/upload.js'
import { uploadSingle, uploadMultiple } from '../controllers/filesController.js'

const router = Router()

router.post('/image', uploadImage.single('image'), uploadSingle)
router.post('/images', uploadImage.array('images', 10), uploadMultiple)

export default router

