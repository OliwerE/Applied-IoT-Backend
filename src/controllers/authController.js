/**
 * Module Responsible for authentication.
 */

/**
 * Class represents auth controller.
 */
export class AuthController {
  helloWorld (req, res, next) {
    res.json({ msg: 'hello from authController!' })
  }
}
