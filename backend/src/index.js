import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import equipmentRouter from './routes/equipment.js'
import recommendationsRouter from './routes/recommendations.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/equipment', equipmentRouter)
app.use('/api/recommendations', recommendationsRouter)

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
