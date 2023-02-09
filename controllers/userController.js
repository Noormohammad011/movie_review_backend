import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

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
  //checking if user created
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: user.getSignedJwtToken(),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

export { registerUser }
