/**
 * Module represents main router.
 */

import express from 'express'
import createError from 'http-errors'

export const router = express.Router()

router.get('/', (req, res, next) => { // ToDo add all links!!
  try {
    res.json({
      msg: 'IoT dashboard API',
      links: {
        self: {
          href: process.env.BASE_URL,
          requestTypes: ['GET']
        },
        auth: {
          href: (process.env.BASE_URL + '/auth'),
          requestTypes: ['GET']
        }
      }
    })
  } catch (err) {
    next(createError(500))
  }
})

router.post('/test', (req, res, next) => {
  console.log(req.body)
  res.json({ msg: 'success' })
})

router.use('*', (req, res, next) => next(createError(404)))
