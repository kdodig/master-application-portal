import { z } from 'zod'

const newPasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Old password must be at least 8 characters long'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New password and confirm password must match',
  path: ['confirmPassword'],
})

export default defineEventHandler(async (event) => {
  const userSession = await requireUserSession(event)

  if (!userSession) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const result = await readValidatedBody(event, body => newPasswordSchema.safeParse(body))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to validate inputs.',
      data: result.error.errors,
    })
  }

  const { currentPassword, newPassword } = result.data

  const [adminUser] = await useDatabase()
    .select()
    .from(tables.adminUsers)
    .where(eq(tables.adminUsers.id, userSession.user.id))
    .limit(1)

  if (!adminUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
    })
  }

  const isValidOldPassword = await verifyPassword(adminUser.passwordHash, currentPassword)

  if (!isValidOldPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Current password is incorrect.',
    })
  }

  const newPasswordHash = await hashPassword(newPassword)

  const [updatedUser] = await useDatabase()
    .update(tables.adminUsers)
    .set({
      passwordHash: newPasswordHash,
      isPasswordTemporary: false, // Set to false since the password is now permanent in any case
      updatedAt: new Date(),
    })
    .where(eq(tables.adminUsers.id, userSession.user.id))
    .returning()

  if (!updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update password.',
    })
  }

  // Clear the user session to force re-login
  await clearUserSession(event)

  return {
    message: 'Password changed successfully. Please log in again.',
  }
})
