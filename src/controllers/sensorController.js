/**
 * Sensor controller module
 */

import createError from 'http-errors'
import { SensorReport } from '../models/sensorReport.js'

/**
 * Sensor controller class.
 */
export class SensorControler {
  /**
   * Creates sensor reports for an array of sensor objects.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async updateSensors (req, res, next) {
    try {
      const sensors = req.body

      for (let i = 0; i < sensors.length; i++) {
        const sensor = sensors[i]

        const newSensorReport = new SensorReport({
          sensorName: sensor.sensorName,
          value: sensor.value
        })

        await newSensorReport.save()
      }
      res.status(200).send()
    } catch (err) {
      next(createError(500))
    }
  }
}
