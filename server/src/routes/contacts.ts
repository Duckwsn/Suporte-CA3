import { Router } from 'express'
import * as controller from '../controllers/contact-controller'
import { auth } from '../middleware/auth'

const router = Router()

router.use(auth)

router.get('/', controller.list)
router.get('/:id', controller.detail)
router.post('/', controller.create)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
