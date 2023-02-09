import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const passwordResetTokenSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
})

// Encrypt password using bcrypt
passwordResetTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.token = await bcrypt.hash(this.token, salt)
})

// Match user entered password to hashed password in database
passwordResetTokenSchema.methods.compaireToken = async function (token) {
  return await bcrypt.compare(token, this.token)
}


const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  passwordResetTokenSchema
)

export default PasswordResetToken
