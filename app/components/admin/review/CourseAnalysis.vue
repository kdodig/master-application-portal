<script setup lang="ts">
import type { TabsItem } from '#ui/components/Tabs.vue'
import { titleCase } from 'scule'

const props = defineProps<{
  applicant: FullApplicant
}>()
const emits = defineEmits(['update', 'continue'])

const courses = ref<Course[]>([])

const documentTabs = [
  {
    label: 'Course Descriptions',
    slot: 'descriptions' as const,
  },
  {
    label: 'Transcript of Records',
    slot: 'transcript' as const,
  },
] satisfies TabsItem[]

const scrollPage = ref(0)
function scrollToPage(page?: number | null) {
  if (page !== undefined && page !== null) {
    scrollPage.value = page
  }
}

const toast = useToast()

async function submitCourses() {
  return await $fetch(`/api/admin/applicants/${props.applicant.id}/courses`, {
    method: 'POST',
    body: courses.value,
    onResponseError() {
      toast.add({
        icon: 'lucide:x',
        title: 'Failed to save courses',
        color: 'error',
      })
    },
  })
}

async function handleSubmit() {
  // Update courses
  const updatedCourses = await submitCourses()

  if (!updatedCourses) {
    return
  }

  // Update review status to "personal_skills"
  await $fetch(`/api/admin/applicants/${props.applicant.id}`, {
    method: 'POST',
    body: {
      reviewStatus: 'personal_skills',
    },
    onResponse({ response }) {
      if (response.ok) {
        toast.add({
          icon: 'lucide:check',
          title: 'Applicant status updated to personal skills',
          description: `${props.applicant.firstName} ${props.applicant.lastName} has been moved to personal skills review.`,
          color: 'success',
        })
        emits('continue')
      }
    },
    onResponseError() {
      toast.add({
        icon: 'lucide:x',
        title: 'Failed to update applicant status',
        color: 'error',
      })
    },
  })

  emits('update')
}

const rejectModalOpen = ref(false)
async function rejectApplicant() {
  await submitCourses()

  await $fetch(`/api/admin/applicants/${props.applicant.id}`, {
    method: 'POST',
    body: {
      status: 'rejected',
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        toast.add({
          icon: 'lucide:check',
          title: 'Applicant rejected successfully',
          description: `${props.applicant.firstName} ${props.applicant.lastName} has been rejected.`,
          color: 'success',
        })
        emits('update')
        emits('continue')
        rejectModalOpen.value = false
      } else {
        toast.add({
          icon: 'lucide:x',
          title: 'Failed to reject applicant',
          color: 'error',
        })
      }
    },
  })
}

watch(() => props.applicant.bachelorDegree?.courses, (newCourses) => {
  courses.value = newCourses || []
}, { immediate: true, deep: true })
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <div class="flex items-center gap-4 justify-between p-4">
      <div class="flex items-baseline gap-4 text-sm">
        <div class="font-semibold text-xl">
          {{ props.applicant.firstName }} {{ props.applicant.lastName }}
        </div>
        <div>Applicant Number: {{ props.applicant.applicantNumber }}</div>
        <div>UUID: {{ props.applicant.id }}</div>
        <div>Major: {{ titleCase(props.applicant.masterTrack) }}</div>
      </div>

      <div class="flex gap-2">
        <UModal
          v-model:open="rejectModalOpen"
          title="Reject Confirmation"
          :description="`Are you sure you want to reject ${props.applicant.firstName} ${props.applicant.lastName}?`"
        >
          <UButton color="error" icon="lucide:x" label="Reject" />

          <template #footer="{ close }">
            <div class="flex justify-end gap-2 w-full">
              <UButton color="neutral" icon="lucide:x" variant="outline" label="Cancel" @click="close" />
              <UButton
                color="error"
                icon="lucide:check"
                label="Reject"
                loading-auto
                @click="rejectApplicant"
              />
            </div>
          </template>
        </UModal>
        <UButton icon="lucide:arrow-right" trailing loading-auto @click="handleSubmit">
          Continue
        </UButton>
      </div>
    </div>

    <AdminReviewCoursesProgress :courses="courses" />

    <div class="grid grid-cols-2 xl:grid-cols-5 overflow-hidden h-full gap-4 p-4">
      <div class="overflow-y-auto h-full xl:col-span-3 p-px">
        <div class="flex flex-col gap-2">
          <UCard
            v-for="(course, index) in courses"
            :key="index"
            :ui="{ body: 'flex flex-col gap-2 p-2 lg:p-2' }"
            class="shrink-0"
            @click="scrollToPage(course.page)"
          >
            <UForm :state="courses" :schema="undefined" class="grid grid-cols-3 gap-2">
              <UFormField name="name" label="Course">
                <UInput v-model="course.reviewedName" placeholder="Course Name" class="w-full" />

                <template #help>
                  <div class="flex flex-col">
                    <span>AI Prediction: {{ course.predictedName }}</span>
                    <span>Applicant: {{ course.applicantName }}</span>
                  </div>
                </template>
              </UFormField>
              <UFormField name="credits" label="Credits">
                <UInput
                  v-model="course.reviewedCredits"
                  type="number"
                  placeholder="Credits"
                  class="w-full"
                  :step="0.5"
                />

                <template #help>
                  <div class="flex flex-col">
                    <span>AI Prediction: {{ course.predictedCredits }}</span>
                    <span>Applicant: {{ course.applicantCredits }}</span>
                  </div>
                </template>
              </UFormField>
              <UFormField name="subjectArea" label="Subject Area">
                <AdminReviewSubjectAreaSelect v-model="course.reviewedSubjectArea as SubjectArea" />

                <template #help>
                  <div class="flex flex-col">
                    <span>AI Prediction: {{ titleCase(course.predictedSubjectArea) }}</span>
                    <span>Applicant: {{ titleCase(course.applicantSubjectArea) }}</span>
                  </div>
                </template>
              </UFormField>
            </UForm>
            <div class="text-sm text-muted">
              <span class="text-highlighted">Description: </span>
              {{ course.description }}
            </div>
          </UCard>
        </div>
      </div>

      <div class="grow overflow-hidden xl:col-span-2">
        <UTabs
          :items="documentTabs"
          :unmount-on-hide="false"
          class="gap-2 w-full h-full"
          :ui="{ content: 'grow overflow-y-auto' }"
        >
          <template #descriptions>
            <PdfViewer
              v-if="props.applicant.courseDescriptionUploadId"
              :src="`/api/upload/${props.applicant.courseDescriptionUploadId}.pdf`"
              :page="scrollPage"
            />
            <div v-else class="flex flex-1 items-center justify-center h-full text-muted rounded-md border border-default">
              No course description uploaded.
            </div>
          </template>
          <template #transcript>
            <PdfViewer
              v-if="props.applicant.transcriptUploadId"
              :src="`/api/upload/${props.applicant.transcriptUploadId}.pdf`"
            />
            <div v-else class="flex flex-1 items-center justify-center h-full text-muted rounded-md border border-default">
              No transcript uploaded.
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </div>
</template>
