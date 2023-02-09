import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import sendEmail, { generateOtp } from '../utils.js/sendEmail.js'
import EmailVerificationToken from '../models/emailVerificationTokenModel.js'
import { isValidObjectId } from 'mongoose'
import PasswordResetToken from '../models/passwordReserTokenModel.js'
import { generateRandomByte } from '../utils.js/helper.js'

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

  const newEmailVerificationToken = await EmailVerificationToken.create({
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
    newEmailVerificationToken.remove()
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

// @desc    Resend email verification token
// @route   POST /api/v1/users/resend-email-verification-token
// @access  Public

const resendEmailVerificationToken = asyncHandler(async (req, res) => {
  const { userId } = req.body
  const user = await User.findById(userId)
  if (!user) {
    res.status(400)
    throw new Error('User not found')
  }
  if (user.isVerified) {
    res.status(400)
    throw new Error('User already verified')
  }

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  })

  if (alreadyHasToken) {
    res.status(400)
    throw new Error('Already has token')
  }

  let OTP = generateOtp()

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: userId,
    token: OTP,
  })

  await newEmailVerificationToken.save()

  const message = `<p>Your verification OTP</p>

      <h1>${OTP}</h1>`

  try {
    await sendEmail({
      email: user.email,
      subject: 'OTP SEND',
      message,
    })

    res.status(200).json({
      success: true,
      message: `New OTP has been sent to your registered email accout.`,
    })
  } catch (error) {
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

// @desc    Forget Password
// @route   POST /api/v1/users/forget-password
// @access  Public

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }
  const user = await User.findOne({ email })
  if (!user) {
    res.status(400)
    throw new Error('User not found')
  }
  const alreadyHasToken = await PasswordResetToken.findOne({
    owner: user._id,
  })
  if (alreadyHasToken) {
    res.status(400)
    throw new Error('Already has token')
  }

  const token = await generateRandomByte()

  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  })
  await newPasswordResetToken.save()

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`
  const message = `
      <p>Click here to reset password</p>
      <a href='${resetUrl}'>Change Password</a>
    `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    })
    res
      .status(200)
      .json({ success: true, message: `Email send to ${user.email}` })
  } catch (err) {
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

export {
  registerUser,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
}
