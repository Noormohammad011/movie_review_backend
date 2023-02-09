import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
// import ErrorResponse from '../utils.js/errorResponse.js'
import expressAsyncHandler from 'express-async-handler'
import { isValidObjectId } from 'mongoose'
import PasswordResetToken from '../models/passwordReserTokenModel.js'

// // Protect routes
// const protect = expressAsyncHandler(async (req, res, next) => {
//   let token

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     // Set token from Bearer token in header
//     token = req.headers.authorization.split(' ')[1]
//     // Set token from cookie
//   }
//   // else if (req.cookies.token) {
//   //   token = req.cookies.token;
//   // }

//   // Make sure token exists
//   if (!token) {
//     return next(new ErrorResponse('Not authorized to access this route', 401))
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)

//     req.user = await User.findById(decoded.id)

//     next()
//   } catch (err) {
//     return next(new ErrorResponse('Not authorized to access this route', 401))
//   }
// })

// // Grant access to specific roles
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new ErrorResponse(
//           `User role ${req.user.role} is not authorized to access this route`,
//           403
//         )
//       )
//     }
//     next()
//   }
// }

const isValidPassResetToken = expressAsyncHandler(async (req, res, next) => {
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

export { isValidPassResetToken }
