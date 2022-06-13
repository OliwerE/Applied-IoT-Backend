/**
 * Module Responsible for authentication.
 */

import createError from 'http-errors'

/**
 * Class represents auth controller.
 */
export class AuthController {
  getIndex (req, res, next) {
    try {
      res.json({
        msg: 'User authentication',
        links: {
          self: {
            href: (process.env.BASE_URL + '/auth'),
            requestTypes: ['GET']
          },
          csrfToken: {
            href: (process.env.BASE_URL + '/auth/csrf-token'),
            requestTypes: ['GET']
          },
          isAuth: {
            href: (process.env.BASE_URL + '/auth/is-auth'),
            requestTypes: ['GET']
          },
          login: {
            href: (process.env.BASE_URL + '/auth/login'),
            requestTypes: ['POST']
          },
          logout: {
            href: (process.env.BASE_URL + '/auth/logout'),
            requestTypes: ['POST']
          },
          register: {
            href: (process.env.BASE_URL + '/auth/register'),
            requestTypes: ['POST']
          }
        }
      })
    } catch (err) {
      next(createError(500))
    }
  }

  getCsrfToken (req, res, next) {

  }

  isAuth (req, res, next) {

  }

  loginUser (req, res, next) {

  }

  logoutUser (req, res, next) {

  }

  registerUser (req, res, next) {

  }
}
