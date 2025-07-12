import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  getUserByEmail,
  createUser,
  createCollegeStudent,
  createAlumni,
  createEmailVerificationToken,
} from "@/lib/database"
import { hashPassword, validatePassword, validateEmail, generateEmailVerificationToken } from "@/lib/auth"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").trim(),
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternateMobile: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  category: z.enum(["college", "alumni"]),
  // College-specific fields
  course: z.string().optional(),
  graduationYear: z.string().optional(),
  // Alumni-specific fields
  profession: z.string().optional(),
  passedOutYear: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if passwords match
    if (validatedData.password !== validatedData.confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Passwords do not match",
            details: [{ field: "confirmPassword", message: "Passwords do not match" }],
          },
        },
        { status: 400 },
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(validatedData.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password does not meet requirements",
            details: passwordValidation.errors.map((error) => ({ field: "password", message: error })),
          },
        },
        { status: 400 },
      )
    }

    // Validate email format
    if (!validateEmail(validatedData.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email format",
            details: [{ field: "email", message: "Invalid email format" }],
          },
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "User with this email already exists",
            details: [{ field: "email", message: "Email already registered" }],
          },
        },
        { status: 409 },
      )
    }

    // Validate category-specific fields
    if (validatedData.category === "college") {
      if (!validatedData.course || !validatedData.graduationYear) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Course and graduation year are required for college students",
              details: [
                { field: "course", message: "Course is required" },
                { field: "graduationYear", message: "Graduation year is required" },
              ],
            },
          },
          { status: 400 },
        )
      }
    }

    if (validatedData.category === "alumni") {
      if (!validatedData.profession || !validatedData.passedOutYear) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Profession and year passed out are required for alumni",
              details: [
                { field: "profession", message: "Profession is required" },
                { field: "passedOutYear", message: "Year passed out is required" },
              ],
            },
          },
          { status: 400 },
        )
      }
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Create user
    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password_hash: passwordHash,
      mobile_number: validatedData.mobile,
      alternate_mobile_number: validatedData.alternateMobile,
      gender: validatedData.gender,
      category: validatedData.category,
    })

    // Create category-specific record
    if (validatedData.category === "college") {
      await createCollegeStudent({
        user_id: user.id,
        course: validatedData.course!,
        year_of_graduation: Number.parseInt(validatedData.graduationYear!),
      })
    } else {
      await createAlumni({
        user_id: user.id,
        profession: validatedData.profession!,
        year_passed_out: Number.parseInt(validatedData.passedOutYear!),
      })
    }

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await createEmailVerificationToken(user.id, verificationToken, expiresAt)

    // TODO: Send verification email
    console.log(`Verification token for ${user.email}: ${verificationToken}`)

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please check your email for verification.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            category: user.category,
            status: user.status,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)

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
          message: "An error occurred while creating your account",
          details: [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
