import express from 'express'
import { forgetPassword, registerUser, resendEmailVerificationToken, sendResetPasswordTokenStatus, verifyEmail } from '../controllers/userController.js'
import { userValidtor, validate } from '../middleware/validator.js'
import { isValidPassResetToken } from '../middleware/authMiddleware.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)
router.post('/verify-email', verifyEmail)
router.post('/resend-email-verification-token', resendEmailVerificationToken)
router.post('/forget-password', forgetPassword)
router.post(
  '/verify-pass-reset-token',
  isValidPassResetToken,
  sendResetPasswordTokenStatus
)


export default router