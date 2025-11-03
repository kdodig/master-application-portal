import { notInArray } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.array(z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required.'),
  points: z.number().min(1, 'Points must be at least 1.'),
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

  const admin = await requireUserSession(event)
  const skills = validatedBody.data

  if (!skills?.length) {
    return []
  }

  const oldSkillsToKeep = skills
    .filter(skill => skill.id)
    .map(skill => skill.id!) ?? []

  await useDatabase()
    .delete(tables.personalSkills)
    .where(and(
      eq(tables.personalSkills.applicantId, id),
      notInArray(tables.personalSkills.id, oldSkillsToKeep),
    ))

  // Insert or update skills
  const updatedSkills = await useDatabase()
    .insert(tables.personalSkills)
    .values(skills.map(skill => ({
      id: skill.id,
      applicantId: id,
      description: skill.description,
      points: skill.points,
      createdBy: admin.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })))
    .onConflictDoUpdate({
      target: tables.personalSkills.id,
      set: {
        description: sql`EXCLUDED.description`,
        points: sql`EXCLUDED.points`,
        updatedAt: new Date(),
      },
    })
    .returning()

  return updatedSkills
})
