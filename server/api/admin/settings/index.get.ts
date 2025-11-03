export default defineEventHandler(async () => {
  const [settings] = await useDatabase().select().from(tables.settings).limit(1)
  return settings || {}
})
