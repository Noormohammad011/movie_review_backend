import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import sendEmail, { generateOtp } from '../utils.js/sendEmail.js'
import EmailVerificationToken from '../models/emailVerificationTokenModel.js'

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
      subject: 'Password reset token',
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

export { registerUser }
