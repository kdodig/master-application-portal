import { omit } from '#ui/utils'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// zod-scheme for input validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
  // 1. read and validate request-body
  const result = await readValidatedBody(event, body => loginSchema.safeParse(body))

  if (!result.success) {
    await clearUserSession(event)
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to validate inputs.',
    })
  }

  const { email, password } = result.data

  // 2. search for admin user
  const db = useDatabase()
  const [admin] = await db
    .select()
    .from(tables.accounts)
    .where(eq(tables.accounts.email, email))
    .limit(1)

  // 3. check if user exists and if active
  if (!admin?.active) {
    await clearUserSession(event)
    throw createError({
      statusCode: 401,
      statusMessage: 'User is not found or inactive.',
    })
  }

  // 4. check password
  const isValidPassword = await verifyPassword(admin.passwordHash, password)

  if (!isValidPassword) {
    await clearUserSession(event)
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password.',
    })
  }

  // 5. update LastLoginAt
  const [updatedAdmin] = await db
    .update(tables.accounts)
    .set({ lastLogin: new Date() })
    .where(eq(tables.accounts.id, admin.id))
    .returning()

  const sessionUser = omit(updatedAdmin, ['passwordHash'])

  const userRoles = await db
    .select({
      id: tables.accountsRoles.roleId,
      key: tables.roles.key,
      name: tables.roles.name,
      description: tables.roles.description,
      createdAt: tables.roles.createdAt,
      updatedAt: tables.roles.updatedAt,
    })
    .from(tables.accountsRoles)
    .innerJoin(tables.roles, eq(tables.accountsRoles.roleId, tables.roles.id))
    .where(eq(tables.accountsRoles.accountId, sessionUser.id))

  // 6. set user Session
  await setUserSession(event, {
    user: {
      ...sessionUser,
      roles: userRoles,
    },
  })

  return sessionUser
})
