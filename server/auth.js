import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'projectvault-secret',
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'projectvault-secret')
}
