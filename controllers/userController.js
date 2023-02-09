import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import sendEmail, { generateOtp } from '../utils.js/sendEmail.js'
import EmailVerificationToken from '../models/emailVerificationTokenModel.js'
import { isValidObjectId } from 'mongoose'

// @desc    Register a new user
// @route   POST /api/v1/users
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  //checking user exists with email
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }
  //creating user
  const user = await User.create({
    name,
    email,
    password,
  })

  //generate 6 digit otp
  let OTP = generateOtp()
  await EmailVerificationToken.create({
    owner: user._id,
    token: OTP,
  })

  const message = `<p>Your verification OTP</p>
      <h1>${OTP}</h1>`

  //send email
  try {
    await sendEmail({
      email: user.email,
      subject: 'OTP SEND',
      message,
    })

    res.status(200).json({
      success: true,
      message: `Please verify your email. OTP has been sent to your email accont!`,
    })
  } catch (error) {
    user.remove()
    res.status(500)
    throw new Error('Email could not be sent')
  }
})


// @desc    Verify user email
// @route   POST /api/v1/users/verify-email
// @access  Public

const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, OTP } = req.body

  if (!isValidObjectId(userId)) {
    res.status(400)
    throw new Error('Invalid user id')
  }
  const user = await User.findById(userId)
  if (!user) {
    res.status(400)
    throw new Error('User not found')
  }
  if (user.isVerified) {
    res.status(400)
    throw new Error('User already verified')
  }

  const token = await EmailVerificationToken.findOne({ owner: userId })
  if (!token) {
    res.status(400)
    throw new Error('Invalid token')
  }
  const isMatched = await token.compaireToken(OTP)
  if (!isMatched) {
    res.status(400)
    throw new Error('Invalid OTP')
  }
  user.isVerified = true
  await user.save()
  await EmailVerificationToken.findByIdAndDelete(token._id)
  const message = `<h1>Welcome to our app and thanks for choosing us.</h1>`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Token varify',
      message,
    })

    res.status(200).json({
      success: true,
      message: `Your email is verified.`,
    })
  } catch (error) {
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

export { registerUser, verifyEmail }
