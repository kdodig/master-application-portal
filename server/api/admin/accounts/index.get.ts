import { aliasedTable } from 'drizzle-orm'

interface AccountWithCreatingAccount extends Account {
  createdByFirstName: string | null
  createdByLastName: string | null
}

const creatingAccounts = aliasedTable(tables.accounts, 'creatingAccounts')

/**
 * Fetches admin accounts.
 */
export default defineEventHandler(async () => {
  const accounts: AccountWithCreatingAccount[] = await useDatabase()
    .select({
      id: tables.accounts.id,
      firstName: tables.accounts.firstName,
      lastName: tables.accounts.lastName,
      email: tables.accounts.email,
      active: tables.accounts.active,
      createdBy: creatingAccounts.id,
      createdByFirstName: creatingAccounts.firstName,
      createdByLastName: creatingAccounts.lastName,
      createdAt: tables.accounts.createdAt,
      updatedAt: tables.accounts.updatedAt,
      lastLogin: tables.accounts.lastLogin,
    })
    .from(tables.accounts)
    .leftJoin(creatingAccounts, eq(creatingAccounts.id, tables.accounts.id))
    .orderBy(desc(tables.accounts.createdAt))

  const accountsWithRoles = await Promise.all(accounts.map(async (account) => {
    const roles = await useDatabase()
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
      .where(eq(tables.accountsRoles.accountId, account.id))

    return {
      ...account,
      roles,
    }
  }))

  return accountsWithRoles || []
})
