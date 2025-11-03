import { count } from 'drizzle-orm'

const cachedApplicantsByStatus = defineCachedFunction(async () => {
  return useDatabase()
    .select({
      status: tables.applicants.reviewStatus,
      applicants: count(),
    })
    .from(tables.applicants)
    .groupBy(tables.applicants.reviewStatus)
    .orderBy(asc(tables.applicants.reviewStatus))
}, {
  maxAge: 60 * 5, // 5 minutes
  name: 'cachedApplicantsByStatus',
})

export default secureEventHandler(true, async () => {
  return await cachedApplicantsByStatus() ?? []
})
