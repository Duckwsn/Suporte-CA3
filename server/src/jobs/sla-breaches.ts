import cron from 'node-cron'
import { detectSlaBreaches } from '../lib/sla'

export function startSlaBreachJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const scanned = await detectSlaBreaches()
      if (scanned > 0) {
        console.log(`[sla-breaches] ${scanned} tickets verificados`)
      }
    } catch (err) {
      console.error('[sla-breaches] erro:', err)
    }
  })
  console.log('[jobs] sla-breaches agendado (a cada 5 min)')
}
