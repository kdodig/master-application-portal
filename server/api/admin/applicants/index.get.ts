import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  masterTrack: z.enum(tables.masterTrackEnum.enumValues).optional(),
  reviewStatus: z.enum(tables.reviewStatusEnum.enumValues).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export default secureEventHandler(true, async (event) => {
  const validatedQuery = await getValidatedQuery(event, querySchema.safeParse)

  if (!validatedQuery.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' })
  }

  const {
    search = undefined,
    page = 1,
    masterTrack = undefined,
    reviewStatus = undefined,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = validatedQuery.data

  let sortCondition

  if (sortBy && sortOrder) {
    const column = (tables.applicants as any)[sortBy]
    if (column) {
      sortCondition = sortOrder === 'desc' ? desc(column) : asc(column)
    }
  }

  const applicants = await useDatabase()
    .select()
    .from(tables.applicants)
    .where(and(
      search
        ? or(
            ilike(tables.applicants.applicantNumber, `%${search}%`),
            ilike(tables.applicants.firstName, `%${search}%`),
            ilike(tables.applicants.lastName, `%${search}%`),
          )
        : undefined,
      masterTrack ? eq(tables.applicants.masterTrack, masterTrack) : undefined,
      reviewStatus ? eq(tables.applicants.reviewStatus, reviewStatus) : undefined,
    ))
    .orderBy(sortCondition || desc(tables.applicants.createdAt))
    .limit(25)
    .offset((page - 1) * 25)

  // Add documents table data to object as a documents property
  const extendedApplicants = await Promise.all(applicants.map(async (applicant) => {
    const [documents] = await useDatabase()
      .select()
      .from(tables.documents)
      .where(eq(tables.documents.applicantId, applicant.id))
      .limit(1)

    const [bachelorDegree] = await useDatabase()
      .select()
      .from(tables.bachelorDegree)
      .where(eq(tables.bachelorDegree.applicantId, applicant.id))
      .limit(1)

    const courses = bachelorDegree
      ? await useDatabase()
        .select()
        .from(tables.courses)
        .where(eq(tables.courses.bachelorDegreeId, bachelorDegree?.id || '')) || []
      : []

    const personalSkills = await useDatabase()
      .select({
        id: tables.personalSkills.id,
        applicantId: tables.personalSkills.applicantId,
        description: tables.personalSkills.description,
        points: tables.personalSkills.points,
        createdAt: tables.personalSkills.createdAt,
        updatedAt: tables.personalSkills.updatedAt,
        createdBy: tables.personalSkills.createdBy,
        createdByFirstName: tables.accounts.firstName,
        createdByLastName: tables.accounts.lastName,
      })
      .from(tables.personalSkills)
      .leftJoin(tables.accounts, eq(tables.personalSkills.createdBy, tables.accounts.id))
      .where(eq(tables.personalSkills.applicantId, applicant.id)) || []

    return {
      ...applicant,
      documents: documents || null,
      bachelorDegree: {
        ...bachelorDegree,
        courses,
      },
      personalSkills,
    }
  })) as FullApplicant[]

  // Get total count for pagination
  const count = await useDatabase()
    .$count(tables.applicants, and(
      search
        ? or(
            ilike(tables.applicants.firstName, `%${search}%`),
            ilike(tables.applicants.lastName, `%${search}%`),
          )
        : undefined,
      masterTrack ? eq(tables.applicants.masterTrack, masterTrack) : undefined,
      reviewStatus ? eq(tables.applicants.reviewStatus, reviewStatus) : undefined,
    ))

  appendResponseHeader(event, 'X-Total-Count', String(count))

  return extendedApplicants || [] as FullApplicant[]
})
