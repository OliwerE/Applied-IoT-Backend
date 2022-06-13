/**
 * Mongoose configuration module.
 */

import session from 'express-session'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'

/**
 * Configures mongoose connection to MongoDB.
 *
 * @param {Function} app - Express application.
 */
export const connectMongoDB = async (app) => {
  // Status messages
  mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected.')
  })
  mongoose.connection.on('error', (error) => {
    console.log(`A mongoose connection error has occured: ${error}`)
  })
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected.')
  })

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose is disconnected because of application termination.')
      process.exit(0)
    })
  })

  await mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const MongoDBSessionStore = MongoStore(session)

  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
    },
    store: new MongoDBSessionStore({ mongooseConnection: mongoose.connection, clear_interval: 3600 })
  }

  // Session options for production
  if (app.get('env') === 'production') {
    sessionOptions.cookie.domain = process.env.COOKIE_DOMAIN
    sessionOptions.cookie.secure = true
  }
  app.use(session(sessionOptions))
}
