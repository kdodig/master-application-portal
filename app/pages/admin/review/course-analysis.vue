<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Row } from '@tanstack/vue-table'
import type { FullApplicant } from '~~/server/utils/useDatabase'
import { titleCase } from 'scule'
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

const { data: applicants, pending, refresh } = await useFetch('/api/admin/applicants', {
  query: {
    search,
    reviewStatus: 'course_analysis',
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

const selectedApplicant = ref<FullApplicant>()
const showCourseAnalysisReview = ref(false)

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

function countCredits(row: Row<FullApplicant>, subjectArea?: SubjectArea | Array<SubjectArea>) {
  const subjectAreas = subjectArea ? (Array.isArray(subjectArea) ? subjectArea : [subjectArea]) : undefined
  return row.original.bachelorDegree?.courses?.filter((c) => {
    if (subjectAreas) {
      return subjectAreas.includes(c.reviewedSubjectArea)
    }
    return true
  })?.reduce((sum, course) => sum + (course.reviewedCredits), 0) || 0
}

function subjectAreaCell(row: Row<FullApplicant>, subjectArea: SubjectArea | Array<SubjectArea>, requiredCredits = 24) {
  const credits = countCredits(row, subjectArea)
  return h(UBadge, {
    label: `${credits} / ${requiredCredits}`,
    color: credits >= requiredCredits ? 'success' : 'error',
    variant: 'soft',
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
    accessorKey: 'masterTrack',
    header: 'Major',
    cell: ({ row }) => titleCase(row.original.masterTrack),
  },
  {
    id: 'totalCredits',
    header: 'Credits',
    cell: ({ row }) => subjectAreaCell(row, [
      'information_systems',
      'business_administration',
      'computer_science',
      'quantitative_methods',
    ], 72),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'is.credits',
    header: 'IS',
    cell: ({ row }) => subjectAreaCell(row, 'information_systems'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'ba.credits',
    header: 'BA',
    cell: ({ row }) => subjectAreaCell(row, 'business_administration'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'cs.credits',
    header: 'CS',
    cell: ({ row }) => subjectAreaCell(row, 'computer_science'),
    meta: { class: { th: 'text-center', td: 'text-center' } },
  },
  {
    id: 'qm.credits',
    header: 'QM',
    cell: ({ row }) => subjectAreaCell(row, 'quantitative_methods'),
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
        showCourseAnalysisReview.value = true
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
      v-model:open="showCourseAnalysisReview"
      title="Course Analysis Review"
      fullscreen
      :ui="{ body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <AdminReviewCourseAnalysis
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
          @continue="nextApplicant"
          @update="refresh"
        />
      </template>
    </UModal>
  </div>
</template>
