import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import equipmentRouter from './routes/equipment.js'
import recommendationsRouter from './routes/recommendations.js'
import layoutRouter from './routes/layout.js'
import layoutsRouter from './routes/layouts.js'
import photosRouter from './routes/photos.js'
import designSuggestionsRouter from './routes/designSuggestions.js'
import designRenderRouter from './routes/designRender.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/equipment', equipmentRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/layout', layoutRouter)
app.use('/api/layouts', layoutsRouter)
app.use('/api/photos', photosRouter)
app.use('/api/design-suggestions', designSuggestionsRouter)
app.use('/api/design-render', designRenderRouter)

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
