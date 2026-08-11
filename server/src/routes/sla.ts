import { Router } from 'express'
import * as controller from '../controllers/sla-controller'
import { auth } from '../middleware/auth'
import { supervisorOrAdmin } from '../middleware/admin'

const router = Router()

router.use(auth)

router.get('/policies', controller.listPolicies)
router.post('/policies', supervisorOrAdmin, controller.createPolicy)
router.patch('/policies/:id', supervisorOrAdmin, controller.updatePolicy)
router.delete('/policies/:id', supervisorOrAdmin, controller.removePolicy)

export default router
