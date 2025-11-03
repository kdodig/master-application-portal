import { z } from 'zod'

const paramSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Deletes an admin account by ID.
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

  const [deletedAccount] = await useDatabase()
    .delete(tables.accounts)
    .where(eq(tables.accounts.id, id))
    .returning()

  if (!deletedAccount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Account not found or already deleted.',
    })
  }

  return deletedAccount
})
