import { z } from 'zod'

const bodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  masterTrack: z.enum(masterTrackEnum.enumValues).optional(),
  reviewStatus: z.enum(reviewStatusEnum.enumValues).optional(),
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

  const [applicant] = await useDatabase()
    .update(tables.applicants)
    .set({
      ...validatedBody.data,
      updatedAt: new Date(),
    })
    .where(eq(tables.applicants.id, id))
    .returning()

  if (!applicant) {
    throw createError({ statusCode: 404, message: 'Applicant not found' })
  }

  return applicant
})
