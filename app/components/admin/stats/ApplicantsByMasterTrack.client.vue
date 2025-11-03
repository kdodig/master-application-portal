<script setup lang="ts">
import { titleCase } from 'scule'

const { data } = await useFetch('/api/admin/stats/applicants-by-master-track')

const colors: Record<MasterTrack, string> = {
  data_science: 'var(--ui-success)',
  managing_digital_business: 'var(--ui-info)',
  business_process_management: 'var(--ui-warning)',
}

const applicantsByMasterTrack = computed(() => masterTrackEnum.enumValues.map(masterTrack => ({
  name: titleCase(masterTrack),
  count: data.value?.find(item => item.masterTrack === masterTrack)?.count || 0,
  color: colors[masterTrack],
})))
</script>

<template>
  <UCard>
    <template #header>
      Applicants by Major
    </template>

    <DonutChart
      v-if="applicantsByMasterTrack.length"
      :data="applicantsByMasterTrack.map(item => item.count)"
      :labels="applicantsByMasterTrack"
      :hide-legend="false"
      :radius="3"
      :height="150"
    />
  </UCard>
</template>
