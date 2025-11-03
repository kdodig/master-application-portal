<script lang="ts" setup>
import { ref } from 'vue'

const isClient = ref(false)
const statusList = ['documents', 'course_analysis', 'personal_skills', 'done', 'rejected']
const statusName = ['Documents', 'Courseanalysis', 'Personal skills', 'Done', 'Rejected']
const isLoading = ref(true)

const { data: applicants, pending: applicantsPending } = await useFetch('/api/applicants', {
  query: { includeCourses: 'true' },
})

const { data: applications, pending: applicationsPending } = await useFetch('/api/application', {
  query: { includeCourses: 'true' },
})

const { data: settings, pending: settingsPending } = await useFetch('/api/admin/settings', {
  query: { includeCourses: 'true' },
})

const totalApplications = computed(() => applications.value?.length ?? 0)
const acceptanceRate = computed(() => {
  const all = applicants.value?.length ?? 0
  const done = applicants.value?.filter(a => a.reviewStatus === 'done').length ?? 0
  return all > 0 ? (done / all) * 100 : 0
})

const completedReviews = computed(() =>
  applicants.value?.filter(applicant => applicant.reviewStatus === 'done').length ?? 0,
)
const countryCount = computed(() => {
  const countries = new Set(applicants.value?.map(applicant => applicant.country))
  return countries.size
})

const applicationsPerDay = computed(() => {
  if (!applications.value)
    return {}

  return applications.value.reduce((acc, app) => {
    const date = new Date(app.createdAt).toISOString().split('T')[0] // YYYY-MM-DD
    if (!acc[date])
      acc[date] = 0
    acc[date]++
    return acc
  }, {})
})

const countryMap = countryJson.reduce((acc, country) => {
  acc[country.name] = {
    alpha2: country['alpha-2'],
    countryCode: Number(country['country-code']),
  }
  return acc
}, {} as Record<string, { alpha2: string, countryCode: number }>)

const applicantspercountry = ref<Record<string, number>>({})
watch(applicants, (newVal) => {
  if (!newVal)
    return

  const counts: Record<string, number> = {}

  for (const applicant of newVal) {
    const info = countryMap[applicant.country]
    if (info) {
      counts[info.alpha2] = (counts[info.alpha2] || 0) + 1
    }
  }

  applicantspercountry.value = counts
}, { immediate: true })

const statusColors: Record<string, string> = {
  documents: '#fbbf24', // Gelb
  course_analysis: '#60a5fa', // Blau
  personal_skills: '#34d399', // Grün
  done: '#10b981', // Dunkelgrün
  rejected: '#f87171', // Rot
}

const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    documents: 0,
    course_analysis: 0,
    personal_skills: 0,
    done: 0,
    rejected: 0,
  }

  for (const applicant of applicants.value ?? []) {
    const status = applicant.reviewStatus
    if (statusList.includes(status)) {
      counts[status]++
    }
  }

  return statusList.map((status, idx) => ({
    name: statusName[idx],
    value: counts[status],
    color: statusColors[status],
  }))
})

interface AreaChartItem {
  month: string
  applications: number
}

const startDate = settings.value?.applicationPeriodStart ? new Date(settings.value.applicationPeriodStart) : new Date('2025-01-01T00:00:00Z')
const endDate = settings.value?.applicationPeriodEnd ? new Date(settings.value.applicationPeriodEnd) : new Date('2025-12-31T23:59:59Z')

const totalDuration = endDate.getTime() - startDate.getTime() // Zeit in ms
const intervalDuration = totalDuration / 5

const counts = Array.from({ length: 5 }).fill(0)

// Zähle Einträge pro Intervall
for (const entry of applications.value ?? []) {
  const createdAt = new Date(entry.createdAt)

  if (createdAt >= startDate && createdAt <= endDate) {
    const diff = createdAt.getTime() - startDate.getTime()
    let index = Math.floor(diff / intervalDuration)
    if (index >= 5)
      index = 4 // Absicherung für Randfall
    counts[index]++
  }
}

// Generiere Intervallbeschriftungen für x-Achse
const areaChartLabels = Array.from({ length: 5 }, (_, i) => {
  const rangeStart = new Date(startDate.getTime() + i * intervalDuration)
  const rangeEnd = new Date(rangeStart.getTime() + intervalDuration)
  const formatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' })
  return `${formatter.format(rangeStart)}–${formatter.format(rangeEnd)}`
})

// Erzeuge die AreaChartData dynamisch aus counts und Labels
const AreaChartData: AreaChartItem[] = counts.map((value, i) => ({
  month: areaChartLabels[i],
  applications: value,
}))

// Für Legende o.Ä.
const categories: Record<string, BulletLegendItemInterface> = {
  applications: { name: 'Applications', color: '#22c55e' },
}

// Formatter für x-Achse
const xFormatter = (i: number): string | number => `${AreaChartData[i]?.month ?? ''}`

watch(applicants, (val) => {
  if (val && val.length > 0) {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
    <!-- Karte mit Umrandung -->
    <AdminStatsWorldMap />

    <!-- Untere Statistiken + Zahlen -->
    <div class="flex flex-col gap-4">
      <!-- Applications by Country -->
      <ApplicantsByStatus />

      <!-- Applications per day -->
      <UCard>
        <template #header>
          Applications over Time
        </template>
        <ClientOnly>
          <AreaChart
            :data="AreaChartData"
            :categories="categories"
            :y-num-ticks="4"
            :x-num-ticks="7"
            :y-grid-line="true"
            :legend-position="LegendPosition.Top"
            :hide-legend="false"
            :x-formatter="xFormatter"
            :height="150"
          />
        </ClientOnly>
      </UCard>

      <!-- Zahlenkarten -->
      <AdminStatsNumberCards />
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <UCard class="flex items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-gray-500">
              Total Applications
            </p>
            <p class="text-2xl font-bold">
              {{ totalApplications }}
            </p>
          </div>
        </UCard>
        <UCard class="flex items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-gray-500">
              Acceptance Rate
            </p>
            <p class="text-2xl font-bold">
              {{ acceptanceRate?.toFixed(2) || 0.00 }}%
            </p>
          </div>
        </UCard>
        <UCard class="flex items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-gray-500">
              Completed Reviews
            </p>
            <p class="text-2xl font-bold">
              {{ completedReviews }}
            </p>
          </div>
        </UCard>
        <UCard class="flex items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-gray-500">
              Different Countries
            </p>
            <p class="text-2xl font-bold">
              {{ countryCount }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.vue-map-legend) {
  width: auto;
  align-items: center;
  background-color: white;
  border-radius: 0.25rem;
  position: absolute;
  text-align: center;
}

::v-deep(.vue-map-legend-header) {
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: slategray;
}

::v-deep(.vue-map-legend-content) {

  background-color: white;
  border-radius: 0.25rem;
  color: black;
  text-align: center;
  border: 0px;
}
</style>
