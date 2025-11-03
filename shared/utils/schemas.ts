import { z } from 'zod'
import { masterTrackEnum, subjectAreaEnum } from './database'

export const applicantCreateSchema = z.object({
  applicantNumber: z.string().min(1, 'Applicant Number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  masterTrack: z.enum(masterTrackEnum.enumValues),
  transcriptUploadId: z.string().uuid().optional(),
  courseDescriptionUploadId: z.string().uuid().optional(),
})

export const bachelorDegreeCreateSchema = z.object({
  university: z.string().min(1, 'University is required'),
  country: z.string().min(1, 'Country is required'),
  courseOfStudy: z.string().min(1, 'Course of Study is required'),
  worstPossibleGrade: z.number().min(1).max(5),
  averageGrade: z.number().min(1).max(5),
  bestPossibleGrade: z.number().min(1).max(5),
  creditsInProgram: z.number().min(30).max(450),
  yearsInProgram: z.number().min(1).max(10),
})

export const coursesCreateSchema = z.object({
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
})
export type CourseAtCreation = z.infer<typeof coursesCreateSchema>
