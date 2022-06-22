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

  /**
   * Returns latest value of a specific sensor.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getLatestSensorValue (req, res, next) {
    try {
      const sensorName = req.params.name
      const latestSensorValue = await SensorReport.findOne({ sensorName }).sort({ createdAt: -1 })

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
   * Returns name and current value of all sensors stored in DB.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getAllSensorsLatestValue (req, res, next) {
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
   * Returns average sensor value per hour.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getSensorDayAvgByHour (req, res, next) {
    try {
      const { sensorName } = req.params
      const sensorNames = [sensorName]
      let responseObj = this.#getSensorAvgResponseObj(sensorNames)

      const intervalStart = new Date()
      intervalStart.setUTCHours(intervalStart.getUTCHours(), 0, 0, 0)

      responseObj = await this.#findAllSensorsDayAvgByHour(intervalStart, sensorNames, responseObj)

      res.json({ msg: `Average values per day from ${sensorName} over the last 24 hours.`, sensors: responseObj })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Returns average sensor value of specified interval.
   *
   * @param {Date} intervalStart - Interval start.
   * @param {Date} intervalEnd - Interval end.
   * @param {string} sensorName - Sensor name.
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
   * Returns object with time and value of a sensor interval.
   *
   * @param {Array} intervalData - Query response from database.
   * @param {number} timeAgo - Number represents days or hours ago.
   * @returns {object} - Sensor interval object.
   */
  #getIntervalObj (intervalData, timeAgo) {
    if (intervalData.length === 1) {
      return {
        timeAgo,
        value: intervalData[0].value
      }
    } else {
      return {
        timeAgo,
        value: null
      }
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
      console.log('test')
      const sensorNames = await SensorReport.find().distinct('sensorName')
      let responseObj = this.#getSensorAvgResponseObj(sensorNames)

      const intervalStart = new Date()
      intervalStart.setUTCHours(intervalStart.getUTCHours(), 0, 0, 0)

      responseObj = await this.#findAllSensorsDayAvgByHour(intervalStart, sensorNames, responseObj)

      res.json({ msg: 'Average values per hour from all sensors over the last 24 hours.', sensors: responseObj })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Returns average sensor value per hour for an array of sensor names.
   *
   * @param {Date} intervalStart - Start date of an interval.
   * @param {Array} sensorNames - An array of sensor names.
   * @param {object} responseObj - Response object.
   */
  async #findAllSensorsDayAvgByHour (intervalStart, sensorNames, responseObj) {
    for (let i = 0; i < 24; i++) {
      intervalStart.setHours(intervalStart.getHours() - 1) // skip current hour, beacuse not final value.

      const intervalEnd = new Date(intervalStart)
      intervalEnd.setUTCHours(intervalStart.getUTCHours(), 59, 59, 999)

      for (let a = 0; a < sensorNames.length; a++) { // sane as 275!!!!
        const timeAgo = i + 1
        const intervalData = await this.#getSensorAvgFromInterval(intervalStart, intervalEnd, sensorNames[a], timeAgo)

        const intervalObj = this.#getIntervalObj(intervalData, timeAgo)
        responseObj[sensorNames[a]].push(intervalObj)
      }
    }
    return responseObj
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

      let responseObj = this.#getSensorAvgResponseObj(sensorNames)

      responseObj = await this.#findAllSensorsDayAvgByDay(intervalStart, sensorNames, responseObj, days)

      res.json({ msg: `Average values per day from all sensors over the last ${days} day(s).`, sensors: responseObj })
    } catch (err) {
      next(createError(500))
    }
  }

  /**
   * Returns average sensor value per day for an array of sensor names.
   *
   * @param {Date} intervalStart - Interval start.
   * @param {Array} sensorNames - An array of sensor names.
   * @param {object} responseObj - Response object.
   * @param {number} days - Number of days back to calculate average value for.
   * @returns {object} - Updated response object.
   */
  async #findAllSensorsDayAvgByDay (intervalStart, sensorNames, responseObj, days) {
    for (let i = 0; i < days; i++) {
      intervalStart.setDate(intervalStart.getDate() - 1)

      const intervalEnd = new Date(intervalStart)
      intervalEnd.setUTCHours(23, 59, 59, 999)

      for (let a = 0; a < sensorNames.length; a++) { // same as 205!!!!
        const timeAgo = i + 1
        const intervalData = await this.#getSensorAvgFromInterval(intervalStart, intervalEnd, sensorNames[a], timeAgo)

        const intervalObj = this.#getIntervalObj(intervalData, timeAgo)
        responseObj[sensorNames[a]].push(intervalObj)
      }
    }
    return responseObj
  }

  /**
   * Returns average sensor value per day.
   *
   * @param {object} req - Request object.
   * @param {object} res - Response object.
   * @param {object} next - Next function.
   */
  async getSensorDayAvgByDay (req, res, next) {
    try {
      const { sensorName } = req.params
      const sensorNames = [sensorName]

      let days = req.query.days || 1

      if (days > 30) {
        days = 30
      }

      const intervalStart = new Date()
      intervalStart.setUTCHours(0, 0, 0, 0)

      let responseObj = this.#getSensorAvgResponseObj(sensorNames)

      responseObj = await this.#findAllSensorsDayAvgByDay(intervalStart, sensorNames, responseObj, days)

      res.json({ msg: `Average values per day from ${sensorName} over the last ${days} days.`, sensors: responseObj })
    } catch (err) {
      next(createError(500))
    }
  }
}
