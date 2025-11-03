export default secureEventHandler(true, async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing applicant id' })
  }

  const [applicant] = await useDatabase()
    .select()
    .from(tables.applicants)
    .where(eq(tables.applicants.id, id))

  if (!applicant) {
    throw createError({ statusCode: 404, message: 'Applicant not found' })
  }

  return applicant
})
