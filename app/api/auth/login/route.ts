import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getUserByEmail, logLoginAttempt, getRecentLoginAttempts } from "@/lib/database"
import { verifyPassword, generateAccessToken, generateRefreshToken } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Check rate limiting
    const recentAttempts = await getRecentLoginAttempts(validatedData.email)
    if (recentAttempts >= 5) {
      await logLoginAttempt(validatedData.email, clientIP, userAgent, false)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many failed login attempts. Please try again in 15 minutes.",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 429 },
      )
    }

    // Get user
    const user = await getUserByEmail(validatedData.email)
    if (!user) {
      await logLoginAttempt(validatedData.email, clientIP, userAgent, false)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password_hash)
    if (!isValidPassword) {
      await logLoginAttempt(validatedData.email, clientIP, userAgent, false)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // Check if email is verified
    if (!user.email_verified) {
      await logLoginAttempt(validatedData.email, clientIP, userAgent, false)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email address before logging in",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 },
      )
    }

    // Check account status
    if (user.status !== "active" && user.status !== "pending") {
      await logLoginAttempt(validatedData.email, clientIP, userAgent, false)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Your account has been suspended. Please contact support.",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 },
      )
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id)

    // Log successful login
    await logLoginAttempt(validatedData.email, clientIP, userAgent, true)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          category: user.category,
          status: user.status,
          email_verified: user.email_verified,
        },
        accessToken,
      },
      timestamp: new Date().toISOString(),
    })

    // Set refresh token as httpOnly cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during login",
          details: [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
