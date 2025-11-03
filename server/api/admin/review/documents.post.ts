import { omit } from '#ui/utils'
import { z } from 'zod'

const bodySchema = z.object({
  id: z.string().uuid(),
  applicantId: z.string().uuid(),
  curriculumVitae: z.enum(documentStatusEnum.enumValues).optional(),
  schoolCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  bachelorCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  transcriptOfRecords: z.enum(documentStatusEnum.enumValues).optional(),
  courseDescription: z.enum(documentStatusEnum.enumValues).optional(),
  englishCertificate: z.enum(documentStatusEnum.enumValues).optional(),
  standardizedTest: z.enum(documentStatusEnum.enumValues).optional(),
  additionalDocuments: z.enum(documentStatusEnum.enumValues).optional(),
})

const requiredDocumentsSchema = z.object({
  curriculumVitae: z.literal('existing'),
  schoolCertificate: z.literal('existing'),
  bachelorCertificate: z.literal('existing'),
  transcriptOfRecords: z.literal('existing'),
  courseDescription: z.literal('existing'),
  englishCertificate: z.literal('existing'),
})

export default secureEventHandler(true, async (event) => {
  const validatedBody = await readValidatedBody(event, bodySchema.safeParse)

  if (!validatedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const admin = await requireUserSession(event)

  const [updatedDocuments] = await useDatabase()
    .update(tables.documents)
    .set({
      ...omit(validatedBody.data, ['id', 'applicantId']),
      reviewedBy: admin.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(tables.documents.id, validatedBody.data.id))
    .returning()

  if (!updatedDocuments) {
    throw createError({ statusCode: 404, message: 'Documents not found' })
  }

  const {
    success: hasAllRequiredDocuments,
  } = requiredDocumentsSchema.safeParse(updatedDocuments)

  if (hasAllRequiredDocuments) {
    // If all required documents are marked as 'existing', update the applicant's reviewStatus to 'course_analysis'
    const [updatedApplicant] = await useDatabase()
      .update(tables.applicants)
      .set({
        reviewStatus: 'course_analysis',
        updatedAt: new Date(),
      })
      .where(eq(tables.applicants.id, validatedBody.data.applicantId))
      .returning()

    if (!updatedApplicant) {
      throw createError({ statusCode: 404, message: 'Applicant not found' })
    }
  }

  return updatedDocuments
})
