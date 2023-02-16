import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

import asyncHandler from 'express-async-handler'
import { isValidObjectId } from 'mongoose'
import PasswordResetToken from '../models/passwordReserTokenModel.js'

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Make sure token exists
  if (!token) {
    res.status(401)
    throw new Error('Not authorized to access this route')
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized to access this route')
  }
})

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403)
      throw new Error(
        `User role ${req.user.role} is not authorized to access this route`
      )
    }
    next()
  }
}

const isValidPassResetToken = asyncHandler(async (req, res, next) => {
  const { token, userId } = req.body
  if (!token.trim() || !isValidObjectId(userId)) {
    res.status(400)
    throw new Error('Invalid token or user id')
  }
  const resetToken = await PasswordResetToken.findOne({ owner: userId })

  if (!resetToken) {
    res.status(400)
    throw new Error('Invalid token or user id')
  }
  const match = await resetToken.compaireToken(token)

  if (!match) {
    res.status(400)
    throw new Error('Invalid token or user id')
  }
  req.resetToken = resetToken
  next()
})

export { isValidPassResetToken, authorize, protect }
