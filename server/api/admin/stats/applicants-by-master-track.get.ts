const cachedApplicantsByMasterTrack = defineCachedFunction(async () => {
  return useDatabase()
    .select({
      masterTrack: tables.applicants.masterTrack,
      count: count(),
    })
    .from(tables.applicants)
    .groupBy(tables.applicants.masterTrack)
    .orderBy(asc(tables.applicants.masterTrack))
}, {
  maxAge: 60 * 5, // 5 minutes
  name: 'cachedApplicantsByMasterTrack',
})

export default secureEventHandler(true, async () => {
  return await cachedApplicantsByMasterTrack() ?? []
})
