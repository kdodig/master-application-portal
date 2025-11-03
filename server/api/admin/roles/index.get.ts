export default defineEventHandler(async () => {
  const roles = await useDatabase()
    .select()
    .from(tables.roles)
    .orderBy(desc(tables.roles.createdAt))

  return roles
})
