/**
 * Mongoose configuration module.
 */

import mongoose from 'mongoose'

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

  // Connect to database

  const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/applied-iot-testing'
  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}
