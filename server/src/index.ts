import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { startJobs } from './jobs'
import { initRealtime } from './lib/realtime'
import { stopQueueWorkers } from './queue'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 4000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'

app.use(helmet())
app.use(cors({ origin: frontendUrl, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'suporte-ca3', timestamp: new Date().toISOString() })
})

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

const server = createServer(app)
initRealtime(server)

server.listen(port, () => {
  console.log(`Suporte CA3 API rodando em http://localhost:${port}`)
  startJobs()
})

async function shutdown(signal: string) {
  console.log(`\n[${signal}] encerrando servidor...`)
  server.close(async () => {
    await stopQueueWorkers()
    console.log('[shutdown] servidor encerrado')
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
