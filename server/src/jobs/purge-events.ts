import cron from 'node-cron'
import prisma from '../lib/prisma'

const RETENTION_DAYS = 30

export function startPurgeEventsJob() {
  cron.schedule('0 3 * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
      const result = await prisma.webhookEvent.deleteMany({
        where: { processedAt: { not: null }, receivedAt: { lt: cutoff } },
      })
      console.log(`[purge-events] ${result.count} eventos antigos removidos`)
    } catch (err) {
      console.error('[purge-events] erro:', err)
    }
  })
  console.log('[jobs] purge-events agendado (diário 03:00)')
}
