import { v4 as uuidv4 } from 'uuid'

// TODO: Seed correct roles required for the application

/**
 * Task to insert initial roles into the database.
 *
 * @see https://devtools.nuxt.com/guide/features#tasks
 */
export default defineTask({
  meta: {
    name: 'db:seed-roles',
    description: 'Insert initial admin roles into the database',
  },
  async run() {
    // eslint-disable-next-line node/prefer-global/process
    const { SEED_ADMIN_EMAIL } = process.env

    if (!SEED_ADMIN_EMAIL) {
      throw new Error('Missing SEED_ADMIN_EMAIL environment variable.')
    }

    // eslint-disable-next-line no-console
    console.log('Creating initial admin roles...')

    const [adminAccount] = await useDatabase()
      .select()
      .from(tables.accounts)
      .where(eq(tables.accounts.email, SEED_ADMIN_EMAIL))

    if (!adminAccount) {
      return { result: 'error', message: 'Admin account not found. Please run the db:seed-admin task first.' }
    }

    const adminUuid = adminAccount.id

    const roles: Role[] = [
      {
        id: uuidv4(),
        key: 'admin',
        name: 'admin',
        description: 'Administrator with full access',
        createdBy: adminUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'user',
        name: 'user',
        description: 'Regular user with limited access',
        createdBy: adminUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'guest',
        name: 'guest',
        description: 'Guest user with minimal access',
        createdBy: adminUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await useDatabase().insert(tables.roles).values(roles)

    return { result: 'success', message: 'Initial roles created successfully.' }
  },
})
