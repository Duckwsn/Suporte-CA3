import { Router } from 'express'
import * as controller from '../controllers/user-controller'
import { auth } from '../middleware/auth'
import { admin } from '../middleware/admin'

const router = Router()

router.use(auth)

router.get('/', controller.list)
router.get('/:id', controller.detail)
router.post('/', admin, controller.create)
router.patch('/:id', admin, controller.update)
router.delete('/:id', admin, controller.deactivate)

export default router
