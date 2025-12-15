import { Router } from 'express'
import { index, show, create, updateOne, remove } from '../controllers/subCategoryController.js'

const router = Router()

router.get('/', index)
router.get('/:id', show)
router.post('/', create)
router.put('/:id', updateOne)
router.delete('/:id', remove)

export default router

