/**
 * Module represents auth router.
 */

import express from 'express'
import createError from 'http-errors'
import { AuthController } from '../controllers/authController.js'

export const router = express.Router()

const authController = new AuthController()

router.use('/', authController.helloWorld)

router.use('*', (req, res, next) => next(createError(404)))
