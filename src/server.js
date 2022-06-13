/**
 * Express configuration module.
 */

import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import cors from 'cors'
import csurf from 'csurf'
import { connectMongoDB } from './config/mongoose.js'

import { router } from './routes/router.js'

/**
 * Main function for express server.
 */
async function expressServer () {
  const app = express()

  // Express configuration
  app.use(helmet())
  app.set('trust proxy', 1)
  app.use(cors({ origin: process.env.ORIGIN, credentials: true }))
  app.use(logger('dev'))
  app.use(express.json())
  // app.use(csurf({})) // Add in prod

  // Connect to MongoDB
  await connectMongoDB(app)

  // Handle csurf errors.
  app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err) // Invalid csrf token
    res.status(403).json({ msg: 'Invalid csrf token' })
  })

  app.use('/', router)

  // Errors
  app.use((err, req, res, next) => {
    if (err.status === 404) {
      return res.status(404).json({ msg: 'Not Found' })
    }

    if (err.status === 500) {
      return res.status(500).json({ msg: 'Internal Server Error' })
    }
  })

  app.listen(process.env.PORT, () => {
    console.log(`Listens for localhost@${process.env.PORT}`)
    console.log('ctrl + c to terminate')
  })
}
expressServer()
