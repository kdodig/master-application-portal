<script setup lang="ts">
const { data: countriesData } = await useFetch('/api/admin/stats/applicants-by-country')
const { data: statusData } = await useFetch('/api/admin/stats/applicants-by-status')

const totalApplicants = computed(() => {
  return countriesData.value?.reduce((sum, country) => sum + country.applicants, 0) ?? 0
})

const acceptanceRate = computed(() => {
  const done = statusData.value?.find(item => item.status === 'done')?.applicants ?? 0
  const percent = done / totalApplicants.value * 100
  return percent?.toFixed(2) ?? 0
})

const completedReviews = computed(() => {
  const accepted = statusData.value?.find(item => item.status === 'done')?.applicants ?? 0
  const rejected = statusData.value?.find(item => item.status === 'rejected')?.applicants ?? 0
  return accepted + rejected
})

const totalCountries = computed(() => countriesData.value?.length ?? 0)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    <UCard :ui="{ body: 'flex flex-col items-center justify-center' }">
      <div class="text-2xl font-bold text-center">
        {{ totalApplicants }}
      </div>
      <div class="text-sm text-muted text-center">
        Total Applicants
      </div>
    </UCard>

    <UCard :ui="{ body: 'flex flex-col items-center justify-center' }">
      <div class="text-2xl font-bold text-center">
        {{ acceptanceRate }}%
      </div>
      <div class="text-sm text-muted text-center">
        Acceptance Rate
      </div>
    </UCard>

    <UCard :ui="{ body: 'flex flex-col items-center justify-center' }">
      <div class="text-2xl font-bold text-center">
        {{ completedReviews }}
      </div>
      <div class="text-sm text-muted text-center">
        Completed Reviews
      </div>
    </UCard>

    <UCard :ui="{ body: 'flex flex-col items-center justify-center' }">
      <div class="text-2xl font-bold text-center">
        {{ totalCountries }}
      </div>
      <div class="text-sm text-muted text-center">
        Different Countries
      </div>
    </UCard>
  </div>
</template>
