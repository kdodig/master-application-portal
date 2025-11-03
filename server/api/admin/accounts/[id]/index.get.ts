import { z } from 'zod'

const schema = z.object({
  id: z.string().uuid(),
})

/**
 * Fetches a specific admin account by ID.
 */
export default defineEventHandler(async (event) => {
  const validatedParams = await getValidatedRouterParams(event, params => schema.safeParse(params))

  if (!validatedParams.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid account ID.',
      data: validatedParams.error.errors,
    })
  }

  const { id } = validatedParams.data

  const [account] = await useDatabase()
    .select({
      id: tables.accounts.id,
      firstName: tables.accounts.firstName,
      lastName: tables.accounts.lastName,
      email: tables.accounts.email,
      active: tables.accounts.active,
      createdBy: tables.accounts.createdBy,
      createdAt: tables.accounts.createdAt,
      updatedAt: tables.accounts.updatedAt,
      lastLogin: tables.accounts.lastLogin,
    })
    .from(tables.accounts)
    .where(eq(tables.accounts.id, id))
    .limit(1)

  if (!account) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Account not found.',
    })
  }

  const accountRoles = await useDatabase()
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
    .where(eq(tables.accountsRoles.accountId, id))

  return {
    ...account,
    roles: accountRoles,
  } as FullAccount
})
