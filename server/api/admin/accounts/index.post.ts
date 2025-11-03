import type { InferInsertModel } from 'drizzle-orm'
import { omit } from '#ui/utils'
import { z } from 'zod'

/**
 * Schema for account creation validation.
 */
export const accountCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  active: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
})

/**
 * Creates a new admin account.
 */
export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, accountCreateSchema.safeParse)

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data.',
      data: validatedBody.error.errors,
    })
  }

  const { roles, ...accountData } = validatedBody.data
  const temporaryPassword = Math.random().toString(16).slice(2, 18)
  const passwordHash = await hashPassword(temporaryPassword)

  const newAccount: InferInsertModel<typeof tables.accounts> = {
    ...accountData,
    passwordHash,
    passwordTemporary: true,
  }

  const [createdAccount] = await useDatabase()
    .insert(tables.accounts)
    .values(newAccount)
    .returning()

  if (!createdAccount) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create account.',
    })
  }

  if (roles?.length) {
    // Insert roles if provided
    const rolesToInsert = roles.map(roleId => ({
      accountId: createdAccount.id,
      roleId,
    }))

    await useDatabase()
      .insert(tables.accountsRoles)
      .values(rolesToInsert)
  }

  // If account is created successfully, send a welcome email with the temporary password
  // TODO: Implement email sending logic here

  return omit(createdAccount, ['passwordHash', 'passwordTemporary'] as const)
})
