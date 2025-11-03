import { z } from 'zod'

const bodySchema = z.array(z.object({
  id: z.string().uuid(),
  bachelorDegreeId: z.string().uuid(),
  predictedName: z.string().optional(),
  predictedCredits: z.number()
    .min(0.5, 'Credits must be at least 0.5')
    .max(30, 'Credits cannot exceed 30')
    .optional(),
  predictedSubjectArea: z.enum(subjectAreaEnum.enumValues).optional(),
  applicantName: z.string().min(1, 'Course name is required'),
  applicantCredits: z.number()
    .min(0.5, 'Credits must be at least 0.5')
    .max(30, 'Credits cannot exceed 30'),
  applicantSubjectArea: z.enum(subjectAreaEnum.enumValues),
  reviewedName: z.string().min(1, 'Reviewed name is required'),
  reviewedCredits: z.number()
    .min(0.5, 'Reviewed credits must be at least 0.5')
    .max(30, 'Reviewed credits cannot exceed 30'),
  reviewedSubjectArea: z.enum(subjectAreaEnum.enumValues),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description cannot exceed 300 characters')
    .optional(),
  page: z.number().min(1).nullable().optional(),
}))

export default secureEventHandler(true, async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing applicant id' })
  }

  const validatedBody = await readValidatedBody(event, bodySchema.safeParse)

  if (!validatedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const courses = validatedBody.data

  if (!courses?.length) {
    return []
  }

  // Insert or update skills
  const updatedCourses = await useDatabase()
    .insert(tables.courses)
    .values(courses)
    .onConflictDoUpdate({
      target: tables.courses.id,
      set: {
        predictedName: sql`EXCLUDED.predicted_name`,
        predictedCredits: sql`EXCLUDED.predicted_credits`,
        predictedSubjectArea: sql`EXCLUDED.predicted_subject_area`,
        applicantName: sql`EXCLUDED.applicant_name`,
        applicantCredits: sql`EXCLUDED.applicant_credits`,
        applicantSubjectArea: sql`EXCLUDED.applicant_subject_area`,
        reviewedName: sql`EXCLUDED.reviewed_name`,
        reviewedCredits: sql`EXCLUDED.reviewed_credits`,
        reviewedSubjectArea: sql`EXCLUDED.reviewed_subject_area`,
        description: sql`EXCLUDED.description`,
        page: sql`EXCLUDED.page`,
      },
    })
    .returning()

  return updatedCourses
})
