/**
 * Module represents main router.
 */

import express from 'express'
import createError from 'http-errors'

export const router = express.Router()

router.use('/', (req, res, next) => res.json({ msg: 'Hello World!' }))

router.use('*', (req, res, next) => next(createError(404)))
