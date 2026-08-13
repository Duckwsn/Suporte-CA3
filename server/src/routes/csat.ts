import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as csat from '../controllers/csat-controller'

const router = Router()

router.post('/conversations/:id', auth, csat.submit)
router.get('/conversations/:id', auth, csat.conversationRating)
router.get('/summary', auth, csat.summary)

export default router