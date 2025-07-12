import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: "access" }, JWT_SECRET, { expiresIn: "15m" })
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

export function verifyAccessToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type !== "access") return null
    return { userId: decoded.userId, email: decoded.email }
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any
    if (decoded.type !== "refresh") return null
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
