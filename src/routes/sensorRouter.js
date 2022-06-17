/**
 * Module represents sensor router.
 */

import express from 'express'
import createError from 'http-errors'
import { SensorControler } from '../controllers/SensorController.js'

export const router = express.Router()

const sensorController = new SensorControler()

router.post('/', sensorController.updateSensors)

router.use('*', (req, res, next) => next(createError(404)))
