import { count } from 'drizzle-orm'

const cachedApplicantsPerCountry = defineCachedFunction(async () => {
  return useDatabase()
    .select({
      country: tables.bachelorDegree.country,
      applicants: count(),
    })
    .from(tables.bachelorDegree)
    .groupBy(tables.bachelorDegree.country)
    .orderBy(desc(count()))
}, {
  maxAge: 60 * 5, // 5 minutes
  name: 'cachedApplicantsPerCountry',
})

export default secureEventHandler(true, async () => {
  return await cachedApplicantsPerCountry() ?? []
})
