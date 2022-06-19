/**
 * Module represents main router.
 */

import express from 'express'
import createError from 'http-errors'
import { router as sensorRouter } from './sensorRouter.js'

export const router = express.Router()

router.get('/', (req, res, next) => {
  try {
    res.json({
      msg: 'IoT dashboard API workflow test',
      links: {
        self: {
          href: process.env.BASE_URL,
          requestTypes: ['GET']
        },
        sensors: {
          href: (process.env.BASE_URL + '/sensors'),
          requestTypes: ['GET']
        }
      }
    })
  } catch (err) {
    next(createError(500))
  }
})

router.use('/sensors', sensorRouter)

router.use('*', (req, res, next) => next(createError(404)))
