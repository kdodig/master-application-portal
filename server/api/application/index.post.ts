import { z } from 'zod'

// Request body schema
const bodySchema = z.object({
  applicant: applicantCreateSchema,
  bachelorDegree: bachelorDegreeCreateSchema,
  courses: z.array(coursesCreateSchema),
})

// Inserts a new application into the database
export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, bodySchema.parse)

  const { applicant, bachelorDegree, courses } = validatedBody

  // Insert the applicant in the applicants table
  const [insertedApplicant] = await useDatabase().insert(tables.applicants).values({
    ...applicant,
    updatedAt: new Date(),
  }).returning()

  // Insert the bachelor degree in the bachelorDegree table
  const [insertedBachelorDegree] = await useDatabase().insert(tables.bachelorDegree).values({
    applicantId: insertedApplicant.id,
    ...bachelorDegree,
    updatedAt: new Date(),
  }).returning()

  // Normalize courses to ensure all fields are present
  type CourseToInsert = Omit<Course, 'id'>
  const normalizedCourses: CourseToInsert[] = courses.map(course => ({
    bachelorDegreeId: insertedBachelorDegree.id,
    predictedName: null,
    predictedCredits: null,
    predictedSubjectArea: null,
    description: null,
    page: null,
    ...course,
  }))

  // Insert all courses in the courses table
  const insertedCourses = await useDatabase().insert(tables.courses).values(normalizedCourses).returning()

  // Setup documents table record
  await useDatabase().insert(tables.documents).values({
    applicantId: insertedApplicant.id,
  })

  return {
    applicant: insertedApplicant,
    bachelorDegree: insertedBachelorDegree,
    courses: insertedCourses,
  }
})
