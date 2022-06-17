/**
 * Module represents sensor report.
 *
 */

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  sensorName: {
    type: String,
    minLength: 1,
    maxLength: 1000,
    required: true
  },
  value: {
    type: Number,
    maxLength: 1000,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.index({ createdAt: 1 }, { expireAfterSeconds: 2764800 }) // Removes old data automatically after 32 days.

export const SensorReport = mongoose.model('SensorReport', schema)
