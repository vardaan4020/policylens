import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// ── Schema initialization ────────────────────────────────
export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      email     TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      avatar    TEXT,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      profile_data TEXT NOT NULL,
      updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS policies (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      summary     TEXT,
      data        TEXT NOT NULL,
      created_at  BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS comparisons (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      policy_ids  TEXT NOT NULL,
      result      TEXT NOT NULL,
      created_at  BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
    )
  `
}

// ── Users ────────────────────────────────────────────────
export async function createUser(id: string, name: string, email: string, hashedPassword: string) {
  return await sql`
    INSERT INTO users (id, name, email, password) 
    VALUES (${id}, ${name}, ${email}, ${hashedPassword})
  `
}

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT id, name, email, avatar, created_at 
    FROM users WHERE id = ${id}
  `
  return result[0] || null
}

// ── Policies ─────────────────────────────────────────────
export async function savePolicy(
  id: string, 
  userId: string, 
  name: string, 
  type: string, 
  summary: string, 
  data: object
) {
  return await sql`
    INSERT INTO policies (id, user_id, name, type, summary, data) 
    VALUES (${id}, ${userId}, ${name}, ${type}, ${summary}, ${JSON.stringify(data)})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      summary = EXCLUDED.summary,
      data = EXCLUDED.data
  `
}

export async function getPoliciesByUser(userId: string) {
  return await sql`
    SELECT id, name, type, summary, created_at 
    FROM policies 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
}

export async function getPolicyById(id: string, userId: string) {
  const result = await sql`
    SELECT * FROM policies 
    WHERE id = ${id} AND user_id = ${userId}
  `
  if (!result[0]) return null
  return { ...result[0], data: JSON.parse(result[0].data) }
}

export async function deletePolicy(id: string, userId: string) {
  return await sql`
    DELETE FROM policies 
    WHERE id = ${id} AND user_id = ${userId}
  `
}

// ── Comparisons ──────────────────────────────────────────
export async function saveComparison(
  id: string, 
  userId: string, 
  title: string, 
  policyIds: string[], 
  result: object
) {
  return await sql`
    INSERT INTO comparisons (id, user_id, title, policy_ids, result) 
    VALUES (${id}, ${userId}, ${title}, ${JSON.stringify(policyIds)}, ${JSON.stringify(result)})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      policy_ids = EXCLUDED.policy_ids,
      result = EXCLUDED.result
  `
}

export async function getComparisonsByUser(userId: string) {
  const rows = await sql`
    SELECT id, title, policy_ids, created_at 
    FROM comparisons 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
  return rows.map(r => ({ ...r, policy_ids: JSON.parse(r.policy_ids) }))
}

export async function deleteComparison(id: string, userId: string) {
  return await sql`
    DELETE FROM comparisons 
    WHERE id = ${id} AND user_id = ${userId}
  `
}

// ── User Profiles ────────────────────────────────────────
export async function saveUserProfile(userId: string, profileData: object) {
  const now = Math.floor(Date.now() / 1000)
  return await sql`
    INSERT INTO user_profiles (user_id, profile_data, updated_at) 
    VALUES (${userId}, ${JSON.stringify(profileData)}, ${now})
    ON CONFLICT (user_id) DO UPDATE SET
      profile_data = EXCLUDED.profile_data,
      updated_at = EXCLUDED.updated_at
  `
}

export async function getUserProfile(userId: string) {
  const result = await sql`
    SELECT profile_data FROM user_profiles 
    WHERE user_id = ${userId}
  `
  if (!result[0]) return null
  return JSON.parse(result[0].profile_data)
}
