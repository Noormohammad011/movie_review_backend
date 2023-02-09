import express from 'express'
import { forgetPassword, registerUser, resendEmailVerificationToken, verifyEmail } from '../controllers/userController.js'
import { userValidtor, validate } from '../middleware/validator.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)
router.post('/verify-email', verifyEmail)
router.post('/resend-email-verification-token', resendEmailVerificationToken)
router.post('/forget-password', forgetPassword)


export default router