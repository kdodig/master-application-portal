const cachedApplicantsOverTime = defineCachedFunction(async () => {
  return useDatabase()
    .select({
      year: sql`EXTRACT(YEAR FROM ${tables.applicants.createdAt})`.mapWith(Number),
      month: sql`EXTRACT(MONTH FROM ${tables.applicants.createdAt})`.mapWith(Number),
      day: sql`EXTRACT(DAY FROM ${tables.applicants.createdAt})`.mapWith(Number),
      count: count(),
    })
    .from(tables.applicants)
    .groupBy(({ year, month, day }) => [year, month, day])
    .orderBy(({ year, month, day }) => [year, month, day])
}, {
  maxAge: 60 * 5, // 5 minutes
  name: 'cachedApplicantsOverTime',
})

export default secureEventHandler(true, async () => {
  return await cachedApplicantsOverTime() ?? []
})
