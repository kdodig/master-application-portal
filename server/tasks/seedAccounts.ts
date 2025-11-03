import { seed } from 'drizzle-seed'

export default defineTask({
  meta: {
    name: 'db:seed-accounts',
    description: 'Seeds the database with initial admin accounts.',
  },
  async run() {
    await seed(useDatabase(), { accounts: tables.accounts }).refine(f => ({
      accounts: {
        columns: {
          firstName: f.firstName(),
          lastName: f.lastName(),
          email: f.email(),
          active: f.boolean(),
        },
        count: 20,
      },
    }))

    return { result: 'success' }
  },
})
