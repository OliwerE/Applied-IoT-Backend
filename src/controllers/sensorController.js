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
   * Returns name and current value of all sensors stored in DB.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getAllSensors (req, res, next) {
    try {
      const sensorNames = await SensorReport.find().distinct('sensorName')

      const sensors = []

      for (let i = 0; i < sensorNames.length; i++) {
        const latestSensorValue = await SensorReport.findOne({ sensorName: sensorNames[i] }).sort({ createdAt: -1 })

        const sensor = {
          sensorName: sensorNames[i],
          value: latestSensorValue.value,
          createdAt: latestSensorValue.createdAt
        }
        sensors.push(sensor)
      }

      res.json({ msg: 'All sensors latest value.', sensors })
    } catch (err) {
      next(createError(500))
    }
  }

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
