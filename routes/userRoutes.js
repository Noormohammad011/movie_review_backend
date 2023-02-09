import express from 'express'
import { forgetPassword, registerUser, resendEmailVerificationToken, resetPassword, sendResetPasswordTokenStatus, signIn, verifyEmail } from '../controllers/userController.js'
import { signInValidator, userValidtor, validate, validatePassword } from '../middleware/validator.js'
import { isValidPassResetToken } from '../middleware/authMiddleware.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)
router.post('/sign-in', signInValidator, validate, signIn)
router.post('/verify-email', verifyEmail)
router.post('/resend-email-verification-token', resendEmailVerificationToken)
router.post('/forget-password', forgetPassword)
router.post(
  '/verify-pass-reset-token',
  isValidPassResetToken,
  sendResetPasswordTokenStatus
)

router.post(
  '/reset-password',
  validatePassword,
  validate,
  isValidPassResetToken,
  resetPassword
)



export default router