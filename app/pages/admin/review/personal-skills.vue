<script setup lang="ts">
import type { TableColumn } from '#ui/types'
import type { Row } from '@tanstack/vue-table'
import type { FullApplicant } from '~~/server/utils/useDatabase'
import { titleCase } from 'scule'
import { h, ref, resolveComponent } from 'vue'

const search = ref('')

const masterTrack = ref<MasterTrack | undefined>(undefined)
const masterTracks = masterTrackEnum.enumValues.map(v => ({
  label: titleCase(v),
  value: v,
}))

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
    reviewStatus: 'personal_skills',
    masterTrack,
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
const showPersonalSkillsReview = ref(false)

const UButton = resolveComponent('UButton')
const Icon = resolveComponent('Icon')

function personalSkillsCell(row: Row<FullApplicant>) {
  if (!row.original.personalSkills?.length) {
    return h('span', { class: 'text-muted' }, 'No skills listed')
  }

  return h('ul', { class: 'list-disc list-inside' }, [
    row.original.personalSkills?.map(skill => h('li', { class: 'space-x-2' }, [
      h('span', skill.description),
      h('span', `(${skill.points})`),
    ])),
  ])
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
    header: ({ column }) => sortingHeader(column, 'Major'),
    cell: ({ row }) => titleCase(row.getValue('masterTrack')),
  },
  {
    id: 'personal-skills',
    header: 'Personal Skills',
    cell: ({ row }) => personalSkillsCell(row),
  },
  {
    id: 'actions',
    cell: ({ row }) => h(UButton, {
      icon: 'lucide:arrow-right',
      trailing: true,
      label: 'Review',
      onClick: () => {
        selectedApplicant.value = row.original
        showPersonalSkillsReview.value = true
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
    selectedApplicant.value = applicants.value[currentIndex + 1] || undefined
  }
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
      v-model:open="showPersonalSkillsReview"
      title="Personal Skills Review"
      description="The documents are supplied by the Studierendensekretariat."
      fullscreen
    >
      <template #body>
        <AdminReviewPersonalSkills
          v-if="selectedApplicant"
          :applicant="selectedApplicant"
          @continue="nextApplicant"
          @update="refresh"
        />
      </template>
    </UModal>
  </div>
</template>
