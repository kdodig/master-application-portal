<script setup lang="ts">
import { titleCase } from 'scule'

const props = defineProps<{
  applicant: FullApplicant
}>()
const emits = defineEmits(['update', 'continue'])

const state = reactive({
  id: '',
  applicantId: props.applicant.id,
  curriculumVitae: 'missing' as DocumentStatus,
  schoolCertificate: 'missing' as DocumentStatus,
  bachelorCertificate: 'missing' as DocumentStatus,
  transcriptOfRecords: 'missing' as DocumentStatus,
  courseDescription: 'missing' as DocumentStatus,
  englishCertificate: 'missing' as DocumentStatus,
  standardizedTest: 'missing' as DocumentStatus,
  additionalDocuments: 'missing' as DocumentStatus,
})

watch(() => props.applicant.documents, (newDocuments) => {
  state.id = newDocuments.id
  state.applicantId = props.applicant.id
  state.curriculumVitae = newDocuments.curriculumVitae ?? 'missing'
  state.schoolCertificate = newDocuments.schoolCertificate ?? 'missing'
  state.bachelorCertificate = newDocuments.bachelorCertificate ?? 'missing'
  state.transcriptOfRecords = newDocuments.transcriptOfRecords ?? 'missing'
  state.courseDescription = newDocuments.courseDescription ?? 'missing'
  state.englishCertificate = newDocuments.englishCertificate ?? 'missing'
  state.standardizedTest = newDocuments.standardizedTest ?? 'missing'
  state.additionalDocuments = newDocuments.additionalDocuments ?? 'missing'
}, { immediate: true, deep: true })

const { add } = useToast()

async function submitDocumentsReview(silent?: boolean) {
  await $fetch(`/api/admin/review/documents`, {
    method: 'POST',
    body: state,
    onResponse: ({ response }) => {
      if (!silent) {
        if (response.ok) {
          add({
            icon: 'lucide:check',
            title: 'Document review saved successfully',
            description: `Documents review for ${props.applicant.firstName} ${props.applicant.lastName} has been saved.`,
            color: 'success',
          })
          emits('update')
          emits('continue')
        } else {
          add({
            icon: 'lucide:x',
            title: 'Failed to save document review',
            color: 'error',
          })
        }
      }
    },
  })
}

const rejectModalOpen = ref(false)
async function rejectApplicant() {
  await submitDocumentsReview(true)

  await $fetch(`/api/admin/applicants/${props.applicant.id}`, {
    method: 'POST',
    body: {
      status: 'rejected',
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        add({
          icon: 'lucide:check',
          title: 'Applicant rejected successfully',
          description: `${props.applicant.firstName} ${props.applicant.lastName} has been rejected.`,
          color: 'success',
        })
        emits('update')
        emits('continue')
        rejectModalOpen.value = false
      } else {
        add({
          icon: 'lucide:x',
          title: 'Failed to reject applicant',
          color: 'error',
        })
      }
    },
  })
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full gap-4">
    <div class="flex items-center gap-4 justify-between">
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
        <UButton icon="lucide:arrow-right" trailing loading-auto @click="submitDocumentsReview(false)">
          Continue
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          Curriculum Vitae
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.curriculumVitae" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          School Certificate
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.schoolCertificate" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          Bachelor Certificate
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.bachelorCertificate" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          Transcript of Records
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.transcriptOfRecords" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          Course Description
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.courseDescription" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">
          English Certificate
          <span class="text-error">*</span>
        </span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.englishCertificate" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">Standardized Test</span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.standardizedTest" />
      </div>
      <div class="p-4 border border-default rounded-lg flex items-center gap-4 justify-between">
        <span class="text-lg font-semibold">Additional Documents</span>
        <AdminReviewDocumentStatusRadioGroup v-model="state.additionalDocuments" />
      </div>
    </div>
  </div>
</template>
