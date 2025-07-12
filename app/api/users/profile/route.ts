import { type NextRequest, NextResponse } from "next/server"
import { getUserWithDetails } from "@/lib/database"
import { verifyAccessToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Access token required",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)
    const tokenData = verifyAccessToken(token)

    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired access token",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // Get user with details
    const user = await getUserWithDetails(tokenData.userId)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
            details: [],
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // Format response based on category
    const userData: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      alternate_mobile_number: user.alternate_mobile_number,
      gender: user.gender,
      category: user.category,
      email_verified: user.email_verified,
      mobile_verified: user.mobile_verified,
      status: user.status,
      created_at: user.created_at,
    }

    if (user.category === "college") {
      userData.college_info = {
        course: user.course,
        year_of_graduation: user.year_of_graduation,
        id_card_photo_url: user.id_card_photo_url,
        verification_status: user.college_verification_status,
      }
    } else if (user.category === "alumni") {
      userData.alumni_info = {
        profession: user.profession,
        year_passed_out: user.year_passed_out,
        verification_status: user.alumni_verification_status,
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: userData,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Profile fetch error:", error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching profile",
          details: [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
