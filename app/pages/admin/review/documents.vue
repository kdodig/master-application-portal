<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Row } from '@tanstack/vue-table'
import type { FullApplicant } from '~~/server/utils/useDatabase'
import { h, ref, resolveComponent } from 'vue'

const search = ref('')

const sorting = ref<{ id: keyof FullApplicant, desc: boolean }[]>([])

const page = ref(1)
const pageSize = 25
const total = ref<number | undefined>(undefined)

function clearFilters() {
  search.value = ''
  page.value = 1
}

// Daten abrufen
const { data: applicants, pending, refresh } = await useFetch('/api/admin/applicants', {
  query: {
    search,
    reviewStatus: 'documents',
    page,
    sortBy: toRef(() => sorting.value[0]?.id),
    sortDesc: toRef(() => sorting.value[0]?.desc ? 'desc' : 'asc'),
  },
  onResponse({ response }) {
    const totalItems = response.headers.get('X-Total-Count')
    total.value = totalItems ? Number.parseInt(totalItems, 10) : 1
    if (page.value > Math.ceil(total.value / pageSize)) {
      page.value = Math.max(Math.ceil(total.value / pageSize), 1)
    }
  },
})

const selectedApplicant = ref<FullApplicant | null>(null)
const showDocumentsReview = ref(false)

const UButton = resolveComponent('UButton')
const Icon = resolveComponent('Icon')

function documentStatusCell(row: Row<FullApplicant>, key: keyof FullApplicant['documents']) {
  const documentStatus = row.original.documents[key] as DocumentStatus
  const iconName = documentStatus === 'unclear'
    ? 'lucide:file-question'
    : documentStatus === 'existing'
      ? 'lucide:file-check'
      : 'lucide:file-x'
  const textColor = documentStatus === 'unclear'
    ? 'text-warning'
    : documentStatus === 'existing'
      ? 'text-success'
      : 'text-error'
  return h(Icon, {
    name: iconName,
    class: `size-5 ${textColor}`,
  })
}

const columns: TableColumn<FullApplicant>[] = [
  {
    accessorKey: 'applicantNumber',
    header: ({ column }) => sortingHeader(column, 'Application Nr'),
    cell: ({ row }) => `#${row.getValue('applicantNumber')}`,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => sortingHeader(column, 'Last Name'),
    cell: ({ row }) => `${row.getValue('lastName')}`,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => sortingHeader(column, 'First Name'),
    cell: ({ row }) => `${row.getValue('firstName')}`,
  },
  {
    id: 'documents.curriculumVitae',
    header: 'CV',
    cell: ({ row }) => documentStatusCell(row, 'curriculumVitae'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.schoolCertificate',
    header: 'School Cert.',
    cell: ({ row }) => documentStatusCell(row, 'schoolCertificate'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.bachelorCertificate',
    header: 'Bachelor Cert.',
    cell: ({ row }) => documentStatusCell(row, 'bachelorCertificate'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.transcriptOfRecords',
    header: 'Transcript',
    cell: ({ row }) => documentStatusCell(row, 'transcriptOfRecords'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.courseDescription',
    header: 'Course Desc.',
    cell: ({ row }) => documentStatusCell(row, 'courseDescription'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.englishCertificate',
    header: 'English Cert.',
    cell: ({ row }) => documentStatusCell(row, 'englishCertificate'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.standardizedTest',
    header: 'Std. Test',
    cell: ({ row }) => documentStatusCell(row, 'standardizedTest'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'documents.additionalDocuments',
    header: 'Add. Docs',
    cell: ({ row }) => documentStatusCell(row, 'additionalDocuments'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(UButton, {
      icon: 'lucide:arrow-right',
      trailing: true,
      label: 'Review',
      onClick: () => {
        selectedApplicant.value = row.original
        showDocumentsReview.value = true
      },
    }),
    meta: { class: { td: 'text-right' } },
  },
]

function nextApplicant() {
  if (!selectedApplicant.value || !applicants.value) {
    return
  }
  const currentIndex = applicants.value.findIndex(a => a.id === selectedApplicant.value?.id)
  if (currentIndex >= 0 && currentIndex < applicants.value.length - 2) {
    selectedApplicant.value = applicants.value[currentIndex + 1] as unknown as FullApplicant || undefined
  }
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex p-4 border-b border-accented items-end gap-4 shrink-0">
      <UFormField label="Search">
        <UInput v-model="search" icon="lucide:search" placeholder="Filter..." class="w-56" />
      </UFormField>
      <UButton icon="lucide:x" label="Reset Filters" color="neutral" variant="soft" @click="clearFilters" />
      <ClientOnly>
        <span class="text-muted text-xs w-full flex justify-end">
          Showing {{ applicants?.length || 0 }} of {{ total }} applicants
        </span>
        <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
      </ClientOnly>
    </div>

    <div class="flex-1 overflow-hidden">
      <UTable
        v-model:sorting="sorting"
        :data="applicants"
        :columns="columns"
        :loading="pending"
        sticky
        class="h-full"
      />
    </div>

    <UModal
      v-model:open="showDocumentsReview"
      title="Documents Review"
      description="The documents are supplied by the Studierendensekretariat."
      fullscreen
    >
      <template #body>
        <AdminReviewDocuments
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
          @continue="nextApplicant"
          @update="refresh"
        />
      </template>
    </UModal>
  </div>
</template>
