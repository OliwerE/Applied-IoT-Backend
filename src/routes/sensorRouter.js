/**
 * Module represents sensor router.
 */

import express from 'express'
import createError from 'http-errors'
import { SensorControler } from '../controllers/SensorController.js'

export const router = express.Router()

const sensorController = new SensorControler()

/**
 * Check if API key is valid.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 * @param {object} next - Next function.
 */
const authorize = (req, res, next) => {
  try {
    if (req.headers.authorization === process.env.API_KEY) {
      next()
    } else {
      next(createError(401))
    }
  } catch (err) {
    next(createError(500))
  }
}

router.get('/', (req, res, next) => sensorController.getAllSensors(req, res, next)) // Return all sensors and current value
// router.get('/sensor/:name', ...) // Return current value (and name) of a specific sensor

router.post('/', authorize, (req, res, next) => sensorController.updateSensors(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
