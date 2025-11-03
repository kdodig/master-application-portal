import { omit } from '#ui/utils'

function mapDocumentStatus(status: DocumentStatus | null): '1' | '0' | '?' {
  switch (status) {
    case 'existing':
      return '1'
    case 'missing':
      return '0'
    default:
      return '?'
  }
}

export default secureEventHandler(true, async (event) => {
  const applicants = await useDatabase()
    .select({
      applicantId: tables.applicants.id,
      applicant_number: tables.applicants.applicantNumber,
      first_name: tables.applicants.firstName,
      last_name: tables.applicants.lastName,
      master_track: tables.applicants.masterTrack,
      curriculum_vitae: tables.documents.curriculumVitae,
      school_certificate: tables.documents.schoolCertificate,
      bachelor_certificate: tables.documents.bachelorCertificate,
      transcript_of_records: tables.documents.transcriptOfRecords,
      course_description: tables.documents.courseDescription,
      english_certificate: tables.documents.englishCertificate,
      standardized_test: tables.documents.standardizedTest,
      additional_documents: tables.documents.additionalDocuments,
      course_of_study: tables.bachelorDegree.courseOfStudy,
      university: tables.bachelorDegree.university,
      country: tables.bachelorDegree.country,
      worst_possible_grade: tables.bachelorDegree.worstPossibleGrade,
      average_grade: tables.bachelorDegree.averageGrade,
      best_possible_grade: tables.bachelorDegree.bestPossibleGrade,
      years_in_program: tables.bachelorDegree.yearsInProgram,
      credits_in_program: tables.bachelorDegree.creditsInProgram,
      bachelorDegreeId: tables.bachelorDegree.id,
    })
    .from(tables.applicants)
    .leftJoin(tables.documents, eq(tables.documents.applicantId, tables.applicants.id))
    .leftJoin(tables.bachelorDegree, eq(tables.bachelorDegree.applicantId, tables.applicants.id))
    .where(eq(tables.applicants.reviewStatus, 'done'))

  // Map document status to 1 if 'existing', 0 if 'missing' and ? if 'unclear'
  const applicantsWithMappedDocuments = applicants.map(applicant => ({
    ...applicant,
    curriculum_vitae: mapDocumentStatus(applicant.curriculum_vitae),
    school_certificate: mapDocumentStatus(applicant.school_certificate),
    bachelor_certificate: mapDocumentStatus(applicant.bachelor_certificate),
    transcript_of_records: mapDocumentStatus(applicant.transcript_of_records),
    course_description: mapDocumentStatus(applicant.course_description),
    english_certificate: mapDocumentStatus(applicant.english_certificate),
    standardized_test: mapDocumentStatus(applicant.standardized_test),
    additional_documents: mapDocumentStatus(applicant.additional_documents),
  }))

  // Add bachelor degree information
  const applicantsWithCourses = await Promise.all(applicantsWithMappedDocuments.map(async (applicant) => {
    const courses = applicant.bachelorDegreeId
      ? await useDatabase()
          .select()
          .from(tables.courses)
          .where(eq(tables.courses.bachelorDegreeId, applicant.bachelorDegreeId))
      : []

    const relevantSubjectAreas = subjectAreaEnum.enumValues.filter(sa => sa !== 'none')

    const ectsByArea = Object.fromEntries(relevantSubjectAreas.map(sa => [
      sa,
      courses
        .filter(c => c.reviewedSubjectArea === sa)
        .reduce((sum, c) => sum + (c.reviewedCredits ?? 0), 0),
    ]))

    const totalEcts = Object.values(ectsByArea).reduce((sum, ects) => sum + ects, 0)

    return {
      ...applicant,
      total_ects: totalEcts,
      ...ectsByArea,
    }
  }))

  const applicantsWithPersonalSkills = await Promise.all(applicantsWithCourses.map(async (applicant) => {
    const personalSkills = await useDatabase()
      .select()
      .from(tables.personalSkills)
      .where(eq(tables.personalSkills.applicantId, applicant.applicantId))

    const sumOfPoints = personalSkills.reduce((sum, ps) => sum + ps.points, 0)

    return {
      ...applicant,
      personal_skills: sumOfPoints,
    }
  }))

  return applicantsWithPersonalSkills.map(applicant => omit(applicant, ['applicantId', 'bachelorDegreeId']))
})
