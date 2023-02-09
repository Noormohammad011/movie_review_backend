import express from 'express'
import { registerUser, verifyEmail } from '../controllers/userController.js'
import { userValidtor, validate } from '../middleware/validator.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)
router.post('/verify-email', verifyEmail)


export default router