import { z } from 'zod'

const bodySchema = z.object({
  curriculumVitae: z.enum(documentStatusEnum.enumValues).optional(),
  schoolCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  bachelorCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  transcriptOfRecords: z.enum(documentStatusEnum.enumValues).optional(),
  courseDescription: z.enum(documentStatusEnum.enumValues).optional(),
  englishCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  standardizedTest: z.enum(documentStatusEnum.enumValues).optional(),
  additionalDocuments: z.enum(documentStatusEnum.enumValues).optional(),
})

export default secureEventHandler(true, async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing applicant id' })
  }

  const validatedBody = await readValidatedBody(event, bodySchema.safeParse)

  if (!validatedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const admin = await requireUserSession(event)

  const data = {
    ...validatedBody.data,
    reviewedBy: admin.user.id,
    reviewedAt: new Date(),
  }

  const [document] = await useDatabase()
    .update(tables.documents)
    .set(data)
    .where(eq(tables.documents.applicantId, id))
    .returning()

  if (!document) {
    throw createError({ statusCode: 404, message: 'Documents not found' })
  }

  return document
})
