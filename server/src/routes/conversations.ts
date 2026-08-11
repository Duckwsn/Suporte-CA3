import { Router } from 'express'
import * as controller from '../controllers/conversation-controller'
import { auth } from '../middleware/auth'

const router = Router()

router.use(auth)

router.get('/', controller.list)
router.get('/:id', controller.detail)
router.post('/', controller.create)
router.patch('/:id/assign', controller.assign)
router.patch('/:id/status', controller.changeStatus)
router.get('/:id/messages', controller.listMessages)
router.post('/:id/messages', controller.sendMessage)

export default router
