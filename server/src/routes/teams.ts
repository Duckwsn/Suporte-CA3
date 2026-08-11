import { Router } from 'express'
import * as controller from '../controllers/team-controller'
import { auth } from '../middleware/auth'
import { supervisorOrAdmin } from '../middleware/admin'

const router = Router()

router.use(auth)

router.get('/', controller.list)
router.get('/:id', controller.detail)
router.post('/', supervisorOrAdmin, controller.create)
router.patch('/:id', supervisorOrAdmin, controller.update)
router.delete('/:id', supervisorOrAdmin, controller.remove)
router.post('/:id/members', supervisorOrAdmin, controller.addMember)
router.delete('/:id/members/:userId', supervisorOrAdmin, controller.removeMember)

export default router
