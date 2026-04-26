import cors from 'cors'
import express from 'express'
import analyzeRouter from './routes/analyze'

const app = express()
const port = Number(process.env.PORT ?? 8787)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/analyze', analyzeRouter)

app.listen(port, () => {
  console.log(`AIGC detector API is running at http://localhost:${port}`)
})
