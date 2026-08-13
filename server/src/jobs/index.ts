import { startSlaBreachJob } from './sla-breaches'
import { startPurgeEventsJob } from './purge-events'
import { startQueueWorkers } from '../queue'

export function startJobs() {
  startSlaBreachJob()
  startPurgeEventsJob()
  startQueueWorkers()
}
