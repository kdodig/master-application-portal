<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Row } from '@tanstack/vue-table'
import { titleCase } from 'scule'
import { h, ref, resolveComponent } from 'vue'

const search = useRouteQuery<string | undefined>('search', undefined)

const masterTrack = ref<MasterTrack | undefined>(undefined)
const masterTracks = masterTrackEnum.enumValues.map(v => ({
  label: titleCase(v),
  value: v,
}))

const reviewStatus = ref<ReviewStatus | undefined>(undefined)
const reviewStatuses = reviewStatusEnum.enumValues.map(v => ({
  label: titleCase(v),
  value: v,
}))

const sorting = ref<{ id: keyof Applicant, desc: boolean }[]>([])

const page = ref(1)
const pageSize = 25
const total = ref<number | undefined>(undefined)

function clearFilters() {
  search.value = ''
  masterTrack.value = undefined
  reviewStatus.value = undefined
  page.value = 1
}

// Daten abrufen
const { data: applicants, pending, refresh } = await useFetch('/api/admin/applicants', {
  query: {
    search,
    masterTrack,
    reviewStatus,
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

const showDeleteModal = ref(false)
async function deleteApplicant(applicantId: string) {
  const toast = useToast()
  await $fetch(`/api/admin/applicants/${applicantId}`, {
    method: 'DELETE',
    onResponse({ response }) {
      if (response.ok) {
        showDeleteModal.value = false
        toast.add({
          icon: 'lucide:check',
          title: 'Applicant deleted',
          description: 'The applicant has been successfully deleted.',
          color: 'success',
        })
        refresh()
      }
    },
    onResponseError() {
      toast.add({
        icon: 'lucide:x',
        title: 'Failed to delete applicant',
        description: 'An error occurred while trying to delete the applicant.',
        color: 'error',
      })
    },
  })
}

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const AdminReviewStatusBadge = resolveComponent('AdminReviewStatusBadge')

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
    cell: ({ row }) => titleCase(row.getValue('masterTrack')),
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

const selectedApplicant = ref<FullApplicant | null>(null)
const showDocumentsReview = ref(false)
const showCourseAnalysisReview = ref(false)
const showPersonalSkillsReview = ref(false)

function getRowItems(row: Row<FullApplicant>) {
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
    {
      type: 'separator',
    },
    {
      label: 'Delete Application',
      color: 'error',
      onSelect() {
        selectedApplicant.value = row.original
        showDeleteModal.value = true
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
      <AdminCsvDownload />
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
      fullscreen
    >
      <template #body>
        <AdminReviewDocuments
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
          @update="refresh"
          @continue="showDocumentsReview = false"
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
          @update="refresh"
          @continue="showCourseAnalysisReview = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="showPersonalSkillsReview" fullscreen title="Personal Skills Review">
      <template #body>
        <AdminReviewPersonalSkills
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
          @update="refresh"
          @continue="showPersonalSkillsReview = false"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="showDeleteModal"
      title="Delete Application"
      description="Are you sure you want to delete this application? This action cannot be undone."
      :ui="{ body: 'space-y-4' }"
    >
      <template #body>
        <div class="flex items-center justify-end gap-4">
          <UButton
            variant="outline"
            color="neutral"
            icon="lucide:x"
            label="Cancel"
            @click="showDeleteModal = false"
          />
          <UButton
            v-if="selectedApplicant"
            color="error"
            icon="lucide:trash-2"
            label="Delete"
            loading-auto
            @click="deleteApplicant(selectedApplicant.id)"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
