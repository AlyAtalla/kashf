import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import healthRouter from './routes/health'
import authRouter from './routes/auth'
import profilesRouter from './routes/profiles'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/profiles', profilesRouter)

app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`)
})
