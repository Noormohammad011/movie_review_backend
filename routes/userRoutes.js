import express from 'express'
import { registerUser, resendEmailVerificationToken, verifyEmail } from '../controllers/userController.js'
import { userValidtor, validate } from '../middleware/validator.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)
router.post('/verify-email', verifyEmail)
router.post('/resend-email-verification-token', resendEmailVerificationToken)


export default router