import type { CustomTableLayout, TDocumentDefinitions } from 'pdfmake/interfaces'
import { titleCase } from 'scule'

export const useApplicationStore = defineStore('applicationStore', {
  state: () => ({
    step: 0,
    coursesPredicted: false,
    maxStep: 3,
    loading: false,
    applicant: {
      applicantNumber: '',
      firstName: '',
      lastName: '',
      masterTrack: 'managing_digital_business' as MasterTrack,
    },
    bachelorDegree: {
      university: '',
      country: '',
      courseOfStudy: '',
      worstPossibleGrade: 5.0,
      averageGrade: 2.5,
      bestPossibleGrade: 1.0,
      creditsInProgram: 180,
      yearsInProgram: 3,
    },
    courseDescription: undefined as File | undefined,
    transcript: undefined as File | undefined,
    courses: Object.fromEntries(
      subjectAreaEnum.enumValues.map(sa => [sa, [] as CourseAtCreation[]]),
    ) as Record<SubjectArea, CourseAtCreation[]>,
    applicantId: undefined as string | undefined,
  }),
  getters: {
    /**
     * Ensures that the resulting courses are flat and have the subject area key that they belong to.
     */
    getCourses(state) {
      return Object.entries(state.courses).flatMap(([key, courses]) => {
        return courses.map(course => ({
          ...course,
          subjectArea: key as SubjectArea,
        }))
      })
    },
  },
  actions: {
    backStep() {
      if (this.step > 0) {
        this.step -= 1
      }
    },
    advanceStep() {
      if (this.step <= this.maxStep) {
        this.step += 1
      }
    },
    addCourse(course: CourseAtCreation) {
      if (course.applicantSubjectArea) {
        this.courses[course.applicantSubjectArea].push(course)
      }
    },
    removeCourse(subjectArea: SubjectArea, index: number) {
      this.courses[subjectArea].splice(index, 1)
    },
    populateCourses(courses: CourseAtCreation[]) {
      Object.keys(this.courses).forEach((key) => {
        this.courses[key as SubjectArea] = []
      })

      courses.forEach((course) => {
        const subjectArea = course.predictedSubjectArea || course.applicantSubjectArea || 'none'
        this.courses[subjectArea].push(course)
      })
    },
    /**
     * Fetches course predictions from the server and populates the subject areas.
     * This function is called when the user has filled out their personal information.
     */
    async getCoursePredictions() {
      this.advanceStep()

      if (this.coursesPredicted === true) {
        return
      }

      this.loading = true

      const courseDescriptionText = await ocrPdf(this.courseDescription as unknown as File)
      const transcriptText = await ocrPdf(this.transcript as unknown as File)
      const combinedText = `${courseDescriptionText}\n\nTranscript of records:\n${transcriptText}`
      const predictedCourses = await $fetch('/api/application/course-predictions', {
        method: 'POST',
        body: {
          text: combinedText,
        },
      })

      const mappedCourses = predictedCourses.map(course => ({
        predictedName: course.name,
        applicantName: course.name,
        reviewedName: course.name,
        predictedCredits: course.credits,
        applicantCredits: course.credits,
        reviewedCredits: course.credits,
        predictedSubjectArea: course.subjectArea,
        applicantSubjectArea: course.subjectArea,
        reviewedSubjectArea: course.subjectArea,
        description: course.description,
        page: course.page,
      })) as CourseAtCreation[]
      this.populateCourses(mappedCourses)

      this.loading = false
      this.coursesPredicted = true
    },
    /**
     * Completes the process by submitting the user's information and the courses.
     */
    async submitApplication() {
      this.loading = true
      const toast = useToast()

      // Upload transcript and course description files first
      const formData = new FormData()
      formData.append('file', this.transcript as unknown as File)
      const transcriptUplad = this.transcript
        ? await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
        : undefined

      formData.delete('file')
      formData.append('file', this.courseDescription as unknown as File)
      const courseDescriptionUpload = this.courseDescription
        ? await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
        : undefined

      // Submit the application data
      const applicant = await $fetch('/api/application', {
        method: 'POST',
        body: {
          applicant: {
            ...this.applicant,
            transcriptUploadId: transcriptUplad?.id,
            courseDescriptionUploadId: courseDescriptionUpload?.id,
          },
          bachelorDegree: this.bachelorDegree,
          courses: this.getCourses,
        },
        onResponse: ({ response }) => {
          if (response.ok) {
            toast.add({
              color: 'success',
              title: 'Success',
              description: 'Your data has been successfully submitted.',
            })
          }
        },
        onResponseError: () => {
          toast.add({
            color: 'error',
            title: 'Error',
            description: 'There was an error in your data. Please try again.',
          })
        },
      })

      this.applicantId = applicant.applicant?.id
      this.loading = false
      return applicant
    },
    getPdfData() {
      const applicableCourses = this.getCourses.filter(c => c.subjectArea !== 'none')
      const docDefinition: TDocumentDefinitions = {
        content: [
          {
            text: 'Curricular Analysis\nMaster of Science in Information Systems',
            margin: [0, 0, 0, 30],
            style: {
              alignment: 'center',
              color: '#2b7fff',
              fontSize: 20,
              bold: true,
              decoration: 'underline',
            },
          },
          {
            text: 'Personal Information',
            style: 'title',
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                ['Surname', this.applicant.lastName],
                ['First Name', this.applicant.firstName],
                ['Applicant Number', this.applicant.applicantNumber],
              ],
            },
            layout: 'default',
          },
          {
            text: 'Bachelor Studies',
            style: 'title',
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                ['University', this.bachelorDegree.university],
                ['Course of study', this.bachelorDegree.courseOfStudy],
              ],
            },
            layout: 'default',
          },
          {
            text: 'Credit Point System',
            style: 'subtitle',
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                ['Regular study period (in years)', this.bachelorDegree.yearsInProgram],
                ['Total Credits upon completion', this.bachelorDegree.creditsInProgram],
              ],
            },
            layout: 'default',
          },
          {
            text: 'Grading System',
            style: 'subtitle',
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                ['Best possible grade', this.bachelorDegree.bestPossibleGrade.toFixed(1)],
                ['Worst possible grade', this.bachelorDegree.worstPossibleGrade.toFixed(1)],
                ['Grade point average (CGPA)', this.bachelorDegree.averageGrade.toFixed(1)],
              ],
            },
            layout: 'default',
          },
          { text: 'List of Modules', style: 'title', pageBreak: 'before' },
          {
            table: {
              widths: ['*', 'auto', 'auto'],
              body: [
                ['Module', 'Subject Area', 'Credits'],
                ...applicableCourses.map(course => ([
                  course.applicantName,
                  titleCase(course.applicantSubjectArea),
                  {
                    text: course.applicantCredits.toString(),
                    alignment: 'right',
                  },
                ])),
              ],
            },
            layout: 'header',
          },
        ],
        footer: () => ({
          text: `${this.applicantId || ''}`,
          alignment: 'center',
          margin: [0, 10, 0, 0],
          fontSize: 8,
          color: '#a1a1a1',
        }),
        defaultStyle: {
          fontSize: 12,
          color: '#404040',
        },
        styles: {
          title: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5],
            decoration: 'underline',
          },
          subtitle: {
            fontSize: 12,
            bold: true,
            margin: [0, 5, 0, 5],
          },
        },
      }

      const tableLayouts: Record<string, CustomTableLayout> = {
        default: {
          hLineColor: () => '#a1a1a1',
          hLineWidth: () => 1,
          vLineColor: () => '#a1a1a1',
          vLineWidth: () => 1,

          paddingTop: () => 4,
          paddingRight: () => 4,
          paddingBottom: () => 4,
          paddingLeft: () => 4,
        },
        header: {
          hLineColor: () => '#a1a1a1',
          hLineWidth: () => 1,
          vLineColor: () => '#a1a1a1',
          vLineWidth: () => 1,

          paddingTop: () => 4,
          paddingRight: () => 4,
          paddingBottom: () => 4,
          paddingLeft: () => 4,

          fillColor: (i: number) => (i === 0 ? '#fafafa' : null),
        },
      }

      return {
        docDefinition,
        tableLayouts,
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useApplicationStore, import.meta.hot))
}
