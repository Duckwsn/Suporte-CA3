import { Router } from 'express'
import { list, detail, create, update, remove } from '../controllers/organization-controller'
import { auth } from '../middleware/auth'
import { admin } from '../middleware/admin'

const router = Router()

router.use(auth)
router.get('/', admin, list)
router.get('/:id', admin, detail)
router.post('/', admin, create)
router.put('/:id', admin, update)
router.delete('/:id', admin, remove)

export default router
