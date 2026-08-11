import { startSlaBreachJob } from './sla-breaches'
import { startPurgeEventsJob } from './purge-events'

export function startJobs() {
  startSlaBreachJob()
  startPurgeEventsJob()
}
