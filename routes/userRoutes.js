import express from 'express'
import { registerUser } from '../controllers/userController.js'
import { userValidtor, validate } from '../middleware/validator.js'
const router = express.Router()



router.post('/create', userValidtor, validate, registerUser)


export default router