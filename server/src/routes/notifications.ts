import { Router } from 'express'
import * as controller from '../controllers/notification-controller'
import { auth } from '../middleware/auth'

const router = Router()

router.use(auth)

router.get('/', controller.list)
router.patch('/read-all', controller.markAllRead)
router.patch('/:id/read', controller.markRead)

export default router
