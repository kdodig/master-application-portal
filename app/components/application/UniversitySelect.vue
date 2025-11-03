<script setup lang="ts">
// Define a v-model binding for the selected university (string)
const value = defineModel<string>()

// Interface representing a university object structure
interface University {
  'alpha_two_code'?: string
  'name': string
  'state-province'?: string
  'country'?: string
  'domains'?: string[]
  'web_pages'?: string[]
}

// Reactive variable for the search input
const searchTerm = ref('')
// Debounced version of the search term to limit API requests
const debouncedSearchTerm = refDebounced(searchTerm, 500)

// Fetch university data from the public API, filtered by debounced search term
const { data: fetchedUnivserities, status } = useFetch<University[]>('http://universities.hipolabs.com/search', {
  query: {
    limit: 20,
    name: debouncedSearchTerm,
  },
  default: () => [],
})

// List of universities created by the user (not from API)
const createdUniversities = ref<University[]>([])
// Combine user-created and fetched universities for the select menu
const universities = computed(() => {
  return [...createdUniversities.value, ...fetchedUnivserities.value]
})

// Computed property to indicate loading state during fetch
const loading = computed(() => status.value === 'pending')

// Handler for creating a new university entry
function onCreateUniversity(name: string) {
  createdUniversities.value.push({ name })
  value.value = name
}
</script>

<template>
  <USelectMenu
    v-model="value"
    v-model:search-term="searchTerm"
    :items="universities"
    label-key="name"
    value-key="name"
    :loading="loading"
    ignore-filter
    icon="lucide:university"
    placeholder="Select your university"
    :multiple="false"
    :reset-search-term-on-select="false"
    :reset-search-term-on-blur="false"
    create-item="always"
    @create="onCreateUniversity"
  />
</template>
