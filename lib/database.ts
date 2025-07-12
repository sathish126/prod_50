import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database utility functions
export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `
  return result[0] || null
}

export async function createUser(userData: {
  name: string
  email: string
  password_hash: string
  mobile_number: string
  alternate_mobile_number?: string
  gender: string
  category: string
}) {
  const result = await sql`
    INSERT INTO users (name, email, password_hash, mobile_number, alternate_mobile_number, gender, category)
    VALUES (${userData.name}, ${userData.email}, ${userData.password_hash}, ${userData.mobile_number}, 
            ${userData.alternate_mobile_number || null}, ${userData.gender}, ${userData.category})
    RETURNING *
  `
  return result[0]
}

export async function createCollegeStudent(studentData: {
  user_id: string
  course: string
  year_of_graduation: number
  id_card_photo_url?: string
  id_card_photo_key?: string
}) {
  const result = await sql`
    INSERT INTO college_students (user_id, course, year_of_graduation, id_card_photo_url, id_card_photo_key)
    VALUES (${studentData.user_id}, ${studentData.course}, ${studentData.year_of_graduation}, 
            ${studentData.id_card_photo_url || null}, ${studentData.id_card_photo_key || null})
    RETURNING *
  `
  return result[0]
}

export async function createAlumni(alumniData: {
  user_id: string
  profession: string
  year_passed_out: number
}) {
  const result = await sql`
    INSERT INTO alumni (user_id, profession, year_passed_out)
    VALUES (${alumniData.user_id}, ${alumniData.profession}, ${alumniData.year_passed_out})
    RETURNING *
  `
  return result[0]
}

export async function createEmailVerificationToken(userId: string, token: string, expiresAt: Date) {
  const result = await sql`
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    RETURNING *
  `
  return result[0]
}

export async function verifyEmailToken(token: string) {
  const result = await sql`
    SELECT evt.*, u.email FROM email_verification_tokens evt
    JOIN users u ON evt.user_id = u.id
    WHERE evt.token = ${token} AND evt.expires_at > NOW() AND evt.used = FALSE
    LIMIT 1
  `
  return result[0] || null
}

export async function markEmailAsVerified(userId: string, tokenId: string) {
  await sql`
    UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ${userId}
  `
  await sql`
    UPDATE email_verification_tokens SET used = TRUE WHERE id = ${tokenId}
  `
}

export async function logLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean) {
  await sql`
    INSERT INTO login_attempts (email, ip_address, user_agent, success)
    VALUES (${email}, ${ipAddress}, ${userAgent}, ${success})
  `
}

export async function getRecentLoginAttempts(email: string, minutes = 15) {
  const result = await sql`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE email = ${email} 
    AND success = FALSE 
    AND attempted_at > NOW() - INTERVAL '${minutes} minutes'
  `
  return Number.parseInt(result[0].count)
}

export async function getUserWithDetails(userId: string) {
  const result = await sql`
    SELECT 
      u.*,
      cs.course, cs.year_of_graduation, cs.id_card_photo_url, cs.verification_status as college_verification_status,
      a.profession, a.year_passed_out, a.verification_status as alumni_verification_status
    FROM users u
    LEFT JOIN college_students cs ON u.id = cs.user_id
    LEFT JOIN alumni a ON u.id = a.user_id
    WHERE u.id = ${userId}
    LIMIT 1
  `
  return result[0] || null
}
