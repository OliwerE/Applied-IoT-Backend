/**
 * Module represents auth router.
 */

import express from 'express'
import createError from 'http-errors'
import { AuthController } from '../controllers/authController.js'

export const router = express.Router()

const authController = new AuthController()

// router.get('/', authController.getIndex)
// router.get('/csrf', authController.getCsrfToken)
// router.get('/is-auth', authController.isAuth)

// router.post('/login', authController.loginUser)
// router.post('/logout', authController.logoutUser)
// router.post('/register', authController.registerUser)

router.use('*', (req, res, next) => next(createError(404)))
