import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'

export { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

export const tables = schema

const drizzleConnection = drizzle(useRuntimeConfig().DATABASE_URL!, { schema })

export function useDatabase() {
  return drizzleConnection
}

// Exported enum types
export type MasterTrack = typeof tables.masterTrackEnum.enumValues[number]
export type ReviewStatus = typeof tables.reviewStatusEnum.enumValues[number]
export type DocumentStatus = typeof tables.documentStatusEnum.enumValues[number]
export type SubjectArea = typeof tables.subjectAreaEnum.enumValues[number]

// Exported table types
export type GlobalSettings = typeof tables.settings.$inferSelect

export type Account = typeof tables.accounts.$inferSelect
export type Role = typeof tables.roles.$inferSelect
export type AccountRoleRelation = typeof tables.accountsRoles.$inferSelect

export type Applicant = typeof tables.applicants.$inferSelect
export type ApplicantDocuments = typeof tables.documents.$inferSelect
export type BachelorDegree = typeof tables.bachelorDegree.$inferSelect
export type Course = typeof tables.courses.$inferSelect
export type ApplicantPersonalSkill = typeof tables.personalSkills.$inferSelect

// Exported combined types
export type FullAccount = Account & {
  roles: Role[]
}

export type FullBachelorDegree = BachelorDegree & {
  courses: Course[]
}

export type PersonalSkillWithCreator = ApplicantPersonalSkill & {
  createdByFirstName?: string
  createdByLastName?: string
}

export interface FullApplicant extends Applicant {
  documents: ApplicantDocuments
  bachelorDegree: FullBachelorDegree
  personalSkills: PersonalSkillWithCreator[]
}
