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

  if (applicant.transcriptUploadId || applicant.courseDescriptionUploadId) {
    const minio = useMinio()
    if (applicant.transcriptUploadId) {
      await minio.removeObject('uploads', `${applicant.transcriptUploadId}.pdf`)
      await useDatabase()
        .delete(tables.uploads)
        .where(eq(tables.uploads.id, applicant.transcriptUploadId))
    }
    if (applicant.courseDescriptionUploadId) {
      await minio.removeObject('uploads', `${applicant.courseDescriptionUploadId}.pdf`)
      await useDatabase()
        .delete(tables.uploads)
        .where(eq(tables.uploads.id, applicant.courseDescriptionUploadId))
    }
  }

  await useDatabase()
    .delete(tables.applicants)
    .where(eq(tables.applicants.id, id))

  return applicant
})
