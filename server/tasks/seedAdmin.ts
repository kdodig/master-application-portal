import { v4 as uuidv4 } from 'uuid'

/**
 * Task to insert an initial admin account into the database.
 * This task is designed to be run once after the initial setup of the application.
 *
 * @see https://devtools.nuxt.com/guide/features#tasks
 */
export default defineTask({
  meta: {
    name: 'db:seed-admin',
    description: 'Insert initial admin account into the database',
  },
  async run() {
    // eslint-disable-next-line node/prefer-global/process
    const {
      SEED_ADMIN_EMAIL,
      SEED_ADMIN_PASSWORD,
      SEED_ADMIN_FIRST_NAME,
      SEED_ADMIN_LAST_NAME,
    } = process.env

    if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
      throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD environment variables.')
    }

    // eslint-disable-next-line no-console
    console.log('Creating initial admin account...')

    const currentTime = new Date()

    const adminAccount: Account = {
      id: uuidv4(),
      firstName: SEED_ADMIN_FIRST_NAME || 'Admin',
      lastName: SEED_ADMIN_LAST_NAME || 'User',
      email: SEED_ADMIN_EMAIL,
      passwordHash: await hashPassword(SEED_ADMIN_PASSWORD),
      active: true,
      passwordTemporary: false, // Set to false for the first admin
      createdAt: currentTime,
      updatedAt: currentTime,
      lastLogin: null,
      createdBy: null,
    }

    await useDatabase().insert(tables.accounts).values(adminAccount)

    return { result: 'success' }
  },
})
