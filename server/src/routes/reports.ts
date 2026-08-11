import { Router } from 'express'
import * as controller from '../controllers/report-controller'
import { auth } from '../middleware/auth'
import { supervisorOrAdmin } from '../middleware/admin'

const router = Router()

router.use(auth)
router.use(supervisorOrAdmin)

router.get('/kpis', controller.kpis)
router.get('/volume', controller.volume)
router.get('/export', controller.exportCsv)

export default router
