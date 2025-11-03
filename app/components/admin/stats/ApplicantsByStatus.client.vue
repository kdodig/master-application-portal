<script setup lang="ts">
import { titleCase } from 'scule'

const { data } = await useFetch('/api/admin/stats/applicants-by-status')

const colors: Record<ReviewStatus, string> = {
  documents: 'var(--ui-color-neutral-500)',
  course_analysis: 'var(--ui-info)',
  personal_skills: 'var(--ui-warning)',
  done: 'var(--ui-success)',
  rejected: 'var(--ui-error)',
}

const applicantsByStatus = computed(() => reviewStatusEnum.enumValues.map(status => ({
  name: titleCase(status),
  applicants: data.value?.find(item => item.status === status)?.applicants || 0,
  color: colors[status],
})))
</script>

<template>
  <UCard>
    <template #header>
      Applicants by Status
    </template>

    <DonutChart
      v-if="applicantsByStatus.length"
      :data="applicantsByStatus.map(item => item.applicants)"
      :labels="applicantsByStatus"
      :hide-legend="false"
      :radius="3"
      :height="150"
    />
  </UCard>
</template>
