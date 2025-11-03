<script setup lang="ts">
const { data } = await useFetch('/api/admin/stats/applicants-over-time', {
  transform: d => d.map(day => ({
    date: new Date(day.year, day.month - 1, day.day)
      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    count: day.count,
  })) ?? [],
})

const categories: Record<string, BulletLegendItemInterface> = {
  count: { name: 'Applicants', color: '#3b82f6' },
}

function xFormatter(tick: number, _i?: number, _ticks?: number[]): string {
  const date = new Date(data.value?.[tick]?.date ?? '')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <UCard>
    <LineChart
      v-if="data?.length"
      :data="data"
      :height="300"
      :categories="categories"
      :x-formatter="xFormatter"
      :y-grid-line="true"
      :y-num-ticks="5"
      y-label="Number of Applicants"
      :curve-type="CurveType.MonotoneX"
      hide-legend
    />
  </UCard>
</template>
