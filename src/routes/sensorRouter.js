/**
 * Module represents sensor router.
 */

import express from 'express'
import createError from 'http-errors'
import bcrypt from 'bcrypt'

import { SensorController } from '../controllers/sensorController.js'

export const router = express.Router()

const sensorController = new SensorController()

/**
 * Check if API key is valid.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 * @param {object} next - Next function.
 */
const authorize = async (req, res, next) => {
  try {
    if (await bcrypt.compare(req.headers.authorization, process.env.API_KEY)) {
      next()
    } else {
      next(createError(401))
    }
  } catch (err) {
    next(createError(500))
  }
}

router.get('/', (req, res, next) => sensorController.getAllSensorsLatestValue(req, res, next))
router.get('/sensor/:name', (req, res, next) => sensorController.getLatestSensorValue(req, res, next))

router.get('/sensor/avg/day/:sensorName', (req, res, next) => sensorController.getSensorDayAvgByDay(req, res, next))
router.get('/sensor/avg/hour/:sensorName', (req, res, next) => sensorController.getSensorDayAvgByHour(req, res, next))

router.get('/avg/hour/all', (req, res, next) => sensorController.getAllSensorsDayAvgByHour(req, res, next))
router.get('/avg/day/all', (req, res, next) => sensorController.getAllSensorsDayAvgByDay(req, res, next))

router.post('/', authorize, (req, res, next) => sensorController.updateSensors(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
