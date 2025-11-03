import { seed } from 'drizzle-seed'

export default defineTask({
  meta: {
    name: 'db:seed-applicants',
    description: 'Seed the applicants table with dummy data.',
  },
  async run() {
    console.log('Seeding applicants...')

    // Delete existing applicants and documents
    console.log('Deleting existing applicants and related data...')
    await useDatabase().delete(tables.applicants)
    console.log('Deleted existing applicants and related data.')

    // Prep data
    const twoMonthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
    const today = new Date()
    const countryNames = countryJson.map(c => c.name)
    const normalizedDummyCourses = coursesPredictionResult.map(c => ({
      predictedName: c.name,
      applicantName: c.name,
      reviewedName: c.name,
      predictedCredits: c.credits,
      applicantCredits: c.credits,
      reviewedCredits: c.credits,
      predictedSubjectArea: c.subjectArea,
      applicantSubjectArea: c.subjectArea,
      reviewedSubjectArea: c.subjectArea,
      description: c.description,
      page: c.page,
    }))

    // Seed applicants
    console.log('Seeding applicants...')
    await seed(useDatabase(), {
      applicants: tables.applicants,
    }).refine(f => ({
      applicants: {
        columns: {
          applicantNumber: f.int({ minValue: 100000, maxValue: 999999, isUnique: true }),
          firstName: f.firstName(),
          lastName: f.lastName(),
          masterTrack: f.valuesFromArray({ values: masterTrackEnum.enumValues }),
          reviewStatus: f.valuesFromArray({ values: reviewStatusEnum.enumValues }),
          createdAt: f.date({ minDate: twoMonthsAgo, maxDate: today }),
          updatedAt: f.date({ minDate: twoMonthsAgo, maxDate: today }),
        },
        count: 1734,
      },
    }))
    console.log('Seeded applicants.')

    const applicants = await useDatabase().select().from(tables.applicants)

    // Seed documents for each applicant
    console.log('Seeding documents for each applicant...')
    for (const applicant of applicants) {
      const hasDocuments = ['course_analysis', 'personal_skills', 'done'].includes(applicant.reviewStatus)
      if (hasDocuments) {
        await useDatabase().insert(tables.documents).values({
          applicantId: applicant.id,
          curriculumVitae: 'existing',
          schoolCertificate: 'existing',
          bachelorCertificate: 'existing',
          transcriptOfRecords: 'existing',
          courseDescription: 'existing',
          englishCertificate: 'existing',
          standardizedTest: 'existing',
          additionalDocuments: 'existing',
        })
      } else {
        await useDatabase().insert(tables.documents).values({
          applicantId: applicant.id,
          curriculumVitae: 'unclear',
          schoolCertificate: 'unclear',
          bachelorCertificate: 'unclear',
          transcriptOfRecords: 'unclear',
          courseDescription: 'unclear',
          englishCertificate: 'unclear',
          standardizedTest: 'unclear',
          additionalDocuments: 'unclear',
        })
      }
    }
    console.log('Seeded documents for each applicant.')

    // Seed course analysis and courses for each applicant
    console.log('Seeding course analysis and courses for each applicant...')
    for (const applicant of applicants) {
      const randomCountry = countryNames[Math.floor(Math.random() * countryNames.length)]
      const [bachelorDegree] = await useDatabase()
        .insert(tables.bachelorDegree)
        .values({
          applicantId: applicant.id,
          university: `University of ${randomCountry}`,
          country: randomCountry,
          courseOfStudy: 'Computer Science',
          worstPossibleGrade: (Math.random() + 3).toFixed(1),
          averageGrade: (Math.random() + 2).toFixed(1),
          bestPossibleGrade: (Math.random() + 1).toFixed(1),
          creditsInProgram: 180 + (Math.random() > 0.5 ? 30 : 0),
          yearsInProgram: 3 + (Math.random() > 0.5 ? 1 : 0),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      await useDatabase()
        .insert(tables.courses)
        .values(normalizedDummyCourses.map(c => ({
          bachelorDegreeId: bachelorDegree.id,
          ...c,
        })))
    }
    console.log('Seeded course analysis and courses for each applicant.')

    // Seed personal skills for each applicant
    console.log('Seeding personal skills for each applicant...')
    const admins = await useDatabase()
      .select()
      .from(tables.accounts)
      .innerJoin(tables.accountsRoles, eq(tables.accounts.id, tables.accountsRoles.accountId))
      .innerJoin(tables.roles, eq(tables.accountsRoles.roleId, tables.roles.id))
      .where(eq(tables.roles.name, 'admin'))

    for (const applicant of applicants) {
      const skills = ['Leadership', 'Teamwork', 'Communication', 'Problem-solving', 'Time management']
      const numberOfSkills = Math.floor(Math.random() * skills.length)
      const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, numberOfSkills)
      const randomAdmin = admins[Math.floor(Math.random() * admins.length)]
      if (numberOfSkills > 0) {
        await useDatabase().insert(tables.personalSkills).values(selectedSkills.map(skill => ({
          applicantId: applicant.id,
          description: skill,
          points: Math.floor(Math.random() * 10) + 1,
          createdBy: randomAdmin.accounts.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })))
      }
    }
    console.log('Seeded personal skills for each applicant.')

    console.log('Finished seeding applicants and related data.')

    return { result: 'success' }
  },
})
