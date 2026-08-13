import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './users'
import teamRoutes from './teams'
import contactRoutes from './contacts'
import conversationRoutes from './conversations'
import ticketRoutes from './tickets'
import slaRoutes from './sla'
import whatsappRoutes from './whatsapp'
import notificationRoutes from './notifications'
import reportRoutes from './reports'
import csatRoutes from './csat'
import organizationRoutes from './organizations'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/teams', teamRoutes)
router.use('/contacts', contactRoutes)
router.use('/conversations', conversationRoutes)
router.use('/tickets', ticketRoutes)
router.use('/sla', slaRoutes)
router.use('/whatsapp', whatsappRoutes)
router.use('/notifications', notificationRoutes)
router.use('/reports', reportRoutes)
router.use('/csat', csatRoutes)
router.use('/organizations', organizationRoutes)

export default router
