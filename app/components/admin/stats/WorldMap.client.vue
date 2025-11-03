<script setup lang="ts">
import { AfricaMap, AsiaMap, EuropeMap, MapChart, NorthAmericaMap, SouthAmericaMap, WorldMap } from 'vue3-map-chart'
import 'vue3-map-chart/dist/style.css'

const { data } = await useFetch('/api/admin/stats/applicants-by-country')

const mapData = computed(() => {
  const countries = data.value?.map((item) => {
    const a2Code = getCountryCodeByName(item.country)
    if (a2Code) {
      return [a2Code, item.applicants] as const
    }
    return false
  })

  return Object.fromEntries(countries?.filter(Boolean) ?? [])
})

const currentMap = ref('World')
const mapOptions = ['World', 'Europe', 'North America', 'South America', 'Asia', 'Africa'] as const

// high-color="#3b82f6"
// low-color="#dbeafe"
// country-stroke-color="#909090"
// default-country-fill-color="#f3f4f6"
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span>Applicants by Country</span>

        <USelect v-model="currentMap" :items="mapOptions" class="w-48" />
      </div>
    </template>

    <div v-auto-animate class="flex items-center justify-center w-full">
      <MapChart v-if="currentMap === 'World'" :data="mapData" :height="700">
        <WorldMap />
      </MapChart>
      <MapChart v-else-if="currentMap === 'Europe'" :data="mapData" :height="700">
        <EuropeMap />
      </MapChart>
      <MapChart v-else-if="currentMap === 'North America'" :data="mapData" :height="700">
        <NorthAmericaMap />
      </MapChart>
      <MapChart v-else-if="currentMap === 'South America'" :data="mapData" :height="700">
        <SouthAmericaMap />
      </MapChart>
      <MapChart v-else-if="currentMap === 'Asia'" :data="mapData" :height="700">
        <AsiaMap />
      </MapChart>
      <MapChart v-else-if="currentMap === 'Africa'" :data="mapData" :height="700">
        <AfricaMap />
      </MapChart>
    </div>
  </UCard>
</template>

<style>
.v3mc-tooltip {
  display: flex !important;
  flex-direction: row !important;
  gap: 0.5rem !important;
  justify-content: space-between !important;
  align-items: center !important;
  min-width: 0 !important;
  background-color: var(--ui-bg) !important;
  color: var(--ui-text) !important;
  border: 1px solid var(--ui-border) !important;
  border-radius: var(--ui-radius) !important;
  padding: 0.25rem 0.5rem !important;
}

.v3mc-tooltip > .v3mc-tooltip-label {
  font-size: 0.875rem !important; /* 0.875rem (14px) */
  line-height: calc(1.25 / 0.875) !important; /* calc(1.25 / 0.875) */
}

.v3mc-tooltip > .v3mc-tooltip-divider {
  display: none !important;
}

.v3mc-tooltip > .v3mc-tooltip-value {
  font-size: 0.875rem !important; /* 0.875rem (14px) */
  line-height: calc(1.25 / 0.875) !important; /* calc(1.25 / 0.875) */
  font-weight: normal !important;
}
</style>
