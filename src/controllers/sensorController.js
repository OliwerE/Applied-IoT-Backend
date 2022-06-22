/**
 * Sensor controller module
 */

import createError from 'http-errors'
import moment from 'moment'

import { SensorReport } from '../models/sensorReport.js'

/**
 * Sensor controller class.
 */
export class SensorController {
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

      res.json({ msg: 'Latest value of all sensors.', sensors })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Returns latest value of a specific sensor.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getSensor (req, res, next) {
    try {
      const sensorName = req.params.name
      const latestSensorValue = await SensorReport.findOne({ sensorName }).sort({ createdAt: -1 })
      console.log(latestSensorValue)

      const sensor = {
        sensorName,
        value: latestSensorValue.value,
        createdAt: latestSensorValue.createdAt
      }

      res.json({ msg: `Latest value from sensor: ${sensorName}`, sensor })
    } catch (err) {
      next(createError(404))
    }
  }

  /**
   * Returns all sensors average value per hour over the last 24 hours.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getAllSensorsDayAvgByHour (req, res, next) {
    try {
      const intervalStart = new Date()
      intervalStart.setUTCHours(intervalStart.getUTCHours(), 0, 0, 0)

      const sensorNames = await SensorReport.find().distinct('sensorName')

      const responseObj = this.#getSensorAvgResponseObj(sensorNames)

      for (let i = 0; i < 24; i++) {
        intervalStart.setHours(intervalStart.getHours() - 1) // skip current hour, beacuse not final value.

        const intervalEnd = new Date(intervalStart)
        intervalEnd.setUTCHours(intervalStart.getUTCHours(), 59, 59, 999)

        for (let a = 0; a < sensorNames.length; a++) {
          const hoursAgo = i + 1
          const avg = await this.#getSensorAvgFromInterval(intervalStart, intervalEnd, sensorNames[a], hoursAgo)

          if (avg.length === 1) {
            responseObj[sensorNames[a]].push({
              hoursAgo,
              value: avg[0].value
            })
          } else {
            responseObj[sensorNames[a]].push({
              hoursAgo,
              value: null
            })
          }
        }
      }

      res.json({ msg: 'Average values per hour from all sensors over the last 24 hours.', sensors: responseObj })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Creates response object for average sensor values.
   *
   * @param {Array} sensorNames - Sensors in the response object.
   * @returns {Array} - Response object.
   */
  #getSensorAvgResponseObj (sensorNames) {
    const responseObj = {}
    for (let i = 0; i < sensorNames.length; i++) { // Add empty array for each sensor in response obj.
      responseObj[sensorNames[i]] = []
    }
    return responseObj
  }

  /**
   * Returns average sensor value of specified interval.
   *
   * @param {Date} intervalStart - Interval start.
   * @param {Date} intervalEnd - Interval end.
   * @param {string} sensorName - sensor name.
   * @param {number} timeAgo - Age of average value.
   */
  async #getSensorAvgFromInterval (intervalStart, intervalEnd, sensorName, timeAgo) {
    const res = await SensorReport.aggregate([
      {
        $match: {
          sensorName,
          createdAt: {
            $gte: intervalStart,
            $lt: intervalEnd
          }
        }
      },
      {
        $group:
        {
          _id: timeAgo,
          value: { $avg: '$value' }
        }
      }
    ])
    return res
  }

  /**
   * Returns all sensors average value per day over the requested amount of days.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getAllSensorsDayAvgByDay (req, res, next) {
    try {
      let days = req.query.days || 1

      if (days > 30) {
        days = 30
      }

      const intervalStart = new Date()
      intervalStart.setUTCHours(0, 0, 0, 0)

      const sensorNames = await SensorReport.find().distinct('sensorName')

      const responseObj = this.#getSensorAvgResponseObj(sensorNames)

      for (let i = 0; i < days; i++) {
        intervalStart.setDate(intervalStart.getDate() - 1)

        const intervalEnd = new Date(intervalStart)
        intervalEnd.setUTCHours(23, 59, 59, 999)

        for (let a = 0; a < sensorNames.length; a++) { // kod duplicering!!
          const daysAgo = i + 1
          const avg = await this.#getSensorAvgFromInterval(intervalStart, intervalEnd, sensorNames[a], daysAgo)

          if (avg.length === 1) {
            responseObj[sensorNames[a]].push({
              daysAgo,
              value: avg[0].value
            })
          } else {
            responseObj[sensorNames[a]].push({
              daysAgo,
              value: null
            })
          }
        }
      }

      res.json({ msg: `Average values per day from all sensors over the last ${days} day(s).`, sensors: responseObj })
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
      console.log(sensors)

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
