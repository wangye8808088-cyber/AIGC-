import cors from 'cors'
import express from 'express'
import 'dotenv/config'
import analyzeRouter from './routes/analyze'
import exportRouter from './routes/export'
import rewriteRouter from './routes/rewrite'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/analyze', analyzeRouter)
app.use('/api/export', exportRouter)
app.use('/api/rewrite', rewriteRouter)

export { app }
