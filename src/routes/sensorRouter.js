/**
 * Module represents sensor router.
 */

import express from 'express'
import createError from 'http-errors'
import { SensorController } from './sensorController.js'

export const router = express.Router()

const sensorController = new SensorController()

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
router.get('/sensor/:name', (req, res, next) => sensorController.getSensor(req, res, next)) // Return current value (and name) of a specific sensor

router.post('/', authorize, (req, res, next) => sensorController.updateSensors(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
