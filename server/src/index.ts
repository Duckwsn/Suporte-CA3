import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { startJobs } from './jobs'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 4000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

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

app.listen(port, () => {
  console.log(`Suporte CA3 API rodando em http://localhost:${port}`)
  startJobs()
})
