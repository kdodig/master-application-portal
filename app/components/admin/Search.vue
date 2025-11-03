<script setup lang="ts">
import { titleCase } from 'scule'

const open = ref(false)
const search = ref('')
const debouncedSearch = debouncedRef(search, 300)

const { data: applicants, pending } = await useFetch('/api/admin/applicants', {
  query: {
    search: debouncedSearch,
  },
  transform: items => items.map(item => ({
    label: `${item.firstName} ${item.lastName}`,
    suffix: `${titleCase(item.masterTrack)} (${item.applicantNumber})`,
    to: `/admin/applicants?search=${item.applicantNumber}`,
    class: 'before:bg-transparent',
    onSelect: () => { open.value = false },
  })),
})

const groups = computed(() => [{
  id: 'applicants',
  label: search.value ? `Applicants matching "${search.value}"` : 'Applicants',
  items: applicants.value || [],
  ignoreFilter: true,
}])
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-2xl' }">
    <UButton icon="lucide:search" label="Search..." color="neutral" variant="outline" class="w-48" />

    <template #content>
      <UCommandPalette
        v-model:search-term="search"
        :groups="groups"
        :loading="pending"
        placeholder="Search for applicants..."
        class="h-96 w-full"
        :ui="{ itemLabelSuffix: 'text-xs' }"
      />
    </template>
  </UModal>
</template>
