/**
 * Module represents main router.
 */

import express from 'express'
import createError from 'http-errors'
import { router as authRouter } from './authRouter.js'

export const router = express.Router()

router.get('/', (req, res, next) => res.json({ msg: 'Hello World!' })) // Remove!!
router.use('/auth', authRouter)

router.use('*', (req, res, next) => next(createError(404)))
