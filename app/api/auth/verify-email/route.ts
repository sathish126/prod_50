import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailToken, markEmailAsVerified } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Verification token is required",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Verify token
    const tokenData = await verifyEmailToken(token)
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired verification token",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Mark email as verified
    await markEmailAsVerified(tokenData.user_id, tokenData.id)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      data: {
        email: tokenData.email,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Email verification error:", error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during email verification",
          details: [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
