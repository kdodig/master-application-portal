import { z } from 'zod'

const paramSchema = z.object({
  id: z.string().uuid(),
})

const accountUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').optional(),
  lastName: z.string().min(1, 'Last name is required.').optional(),
  email: z.string().email('Invalid email address.').optional(),
  active: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
})

/**
 * Updates an admin account by ID.
 */
export default defineEventHandler(async (event) => {
  const validatedParams = await getValidatedRouterParams(event, params => paramSchema.safeParse(params))

  if (!validatedParams.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid account ID.',
      data: validatedParams.error.errors,
    })
  }

  const { id } = validatedParams.data

  const validatedBody = await readValidatedBody(event, body => accountUpdateSchema.safeParse(body))

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data.',
      data: validatedBody.error.errors,
    })
  }

  const { roles, ...updateData } = validatedBody.data

  const [updatedAccount] = await useDatabase()
    .update(tables.accounts)
    .set(updateData)
    .where(eq(tables.accounts.id, id))
    .returning()

  if (!updatedAccount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Account not found or update failed.',
    })
  }

  if (roles !== undefined) {
    // Update roles if provided
    await useDatabase()
      .delete(tables.accountsRoles)
      .where(eq(tables.accountsRoles.accountId, id))

    const rolesToInsert = validatedBody.data.roles?.map(roleId => ({
      accountId: id,
      roleId,
    })) || []

    if (rolesToInsert.length) {
      await useDatabase()
        .insert(tables.accountsRoles)
        .values(rolesToInsert)
    }
  }

  return updatedAccount
})
