import { Router } from 'express'
import { verify, receive } from '../controllers/whatsapp-controller'

const router = Router()

router.get('/webhook', verify)
router.post('/webhook', receive)

export default router
