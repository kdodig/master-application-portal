<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Row } from '@tanstack/vue-table'
import { h, ref, resolveComponent } from 'vue'

// Demo-Filterdaten
const masterTracks = [
  { label: 'Data Science', value: 'data_science' },
  { label: 'Information Systems', value: 'information_systems' },
]
const reviewStatuses = [
  { label: 'Documents', value: 'documents' },
  { label: 'Course Analysis', value: 'course_analysis' },
  { label: 'Personal Skills', value: 'personal_skills' },
  { label: 'Done', value: 'done' },
  { label: 'Rejected', value: 'rejected' },
]

// State
const search = ref('')
const masterTrack = ref<string | undefined>(undefined)
const reviewStatus = ref<string | undefined>(undefined)
const sorting = ref<{ id: string, desc: boolean }[]>([])
const page = ref(1)
const pageSize = 25
const total = ref<number | undefined>(undefined)

// Demo-Daten (vereinfachter FullApplicant)
const allApplicants = ref<any[]>([
  { id: 'a1', applicantNumber: 1001, firstName: 'Max', lastName: 'Mustermann', masterTrack: 'data_science', reviewStatus: 'documents', createdAt: new Date().toISOString(), university: 'Uni Münster', documents: {}, courseAnalysis: { courses: [] } },
  { id: 'a2', applicantNumber: 1002, firstName: 'Erika', lastName: 'Musterfrau', masterTrack: 'information_systems', reviewStatus: 'course_analysis', createdAt: new Date().toISOString(), university: 'Uni Köln', documents: {}, courseAnalysis: { courses: [] } },
  { id: 'a3', applicantNumber: 1003, firstName: 'Jon', lastName: 'Doe', masterTrack: 'data_science', reviewStatus: 'personal_skills', createdAt: new Date().toISOString(), university: 'Uni Bonn', documents: {}, courseAnalysis: { courses: [] } },
  { id: 'a4', applicantNumber: 1004, firstName: 'Anna', lastName: 'Lena', masterTrack: 'information_systems', reviewStatus: 'done', createdAt: new Date().toISOString(), university: 'Uni Bochum', documents: {}, courseAnalysis: { courses: [] } },
  { id: 'a5', applicantNumber: 1005, firstName: 'Kai', lastName: 'Schmidt', masterTrack: 'data_science', reviewStatus: 'rejected', createdAt: new Date().toISOString(), university: 'Uni Dortmund', documents: {}, courseAnalysis: { courses: [] } },
])

const filtered = computed(() => {
  let res = [...allApplicants.value]
  if (search.value) {
    const s = search.value.toLowerCase()
    res = res.filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(s) || `${a.applicantNumber}`.includes(s))
  }
  if (masterTrack.value) res = res.filter(a => a.masterTrack === masterTrack.value)
  if (reviewStatus.value) res = res.filter(a => a.reviewStatus === reviewStatus.value)
  total.value = res.length
  return res
})

const applicants = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const pending = ref(false)

function clearFilters() {
  search.value = ''
  masterTrack.value = undefined
  reviewStatus.value = undefined
  page.value = 1
}

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const AdminReviewStatusBadge = resolveComponent('AdminReviewStatusBadge')

const columns: TableColumn<any>[] = [
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
    accessorKey: 'masterTrack',
    header: 'Major',
    cell: ({ row }) => {
      const value = masterTracks.find(mt => mt.value === row.original.masterTrack)?.label
      return value || row.original.masterTrack
    },
  },
  {
    accessorKey: 'reviewStatus',
    header: 'Review Status',
    cell: ({ row }) => h(AdminReviewStatusBadge, { status: row.original.reviewStatus }),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => sortingHeader(column, 'Submission Date'),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('de-DE'),
  },
  {
    id: 'actions',
    cell: ({ row }) => h(UDropdownMenu, {
      content: {
        align: 'end',
      },
      items: getRowItems(row),
    }, () => h(UButton, {
      icon: 'lucide:ellipsis-vertical',
      color: 'neutral',
      variant: 'ghost',
    })),
    meta: { class: { td: 'text-right' } },
  },
]

const selectedApplicant = ref<any | null>(null)
const showDocumentsReview = ref(false)
const showCourseAnalysisReview = ref(false)
const showPersonalSkillsReview = ref(false)

function getRowItems(row: Row<any>) {
  return [
    {
      label: '1. Documents Review',
      onSelect() {
        selectedApplicant.value = row.original
        showDocumentsReview.value = true
      },
    },
    {
      label: '2. Courses Review',
      onSelect() {
        selectedApplicant.value = row.original
        showCourseAnalysisReview.value = true
      },
    },
    {
      label: '3. Personal Skills Review',
      onSelect() {
        selectedApplicant.value = row.original
        showPersonalSkillsReview.value = true
      },
    },
  ]
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex p-4 border-b border-accented items-end gap-4 shrink-0">
      <UFormField label="Search">
        <UInput v-model="search" icon="lucide:search" placeholder="Filter..." class="w-56" />
      </UFormField>
      <UFormField label="Major">
        <USelect
          v-model="masterTrack"
          :items="masterTracks"
          value-key="value"
          class="w-56"
          placeholder="Major"
        />
      </UFormField>
      <UFormField label="Review Status">
        <USelect
          v-model="reviewStatus"
          :items="reviewStatuses"
          value-key="value"
          class="w-56"
          placeholder="Review Status"
        />
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

    <!-- Modals -->
    <UModal
      v-model:open="showDocumentsReview"
      title="Documents Review"
      description="Demo-Modus: Änderungen werden nicht gespeichert."
      fullscreen
    >
      <template #body>
        <AdminReviewDocuments
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="showCourseAnalysisReview"
      title="Course Analysis Review"
      fullscreen
      :ui="{ body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <AdminReviewCourseAnalysis
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
        />
      </template>
    </UModal>

    <UModal v-model:open="showPersonalSkillsReview" fullscreen title="Personal Skills Review">
      <template #body>
        <AdminReviewPersonalSkills v-if="selectedApplicant" />
      </template>
    </UModal>
  </div>
  
</template>

