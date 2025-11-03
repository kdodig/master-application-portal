<script setup lang="ts">
// Access the course analysis store for state management
import { titleCase } from 'scule'

const applicationStore = useApplicationStore()

// Returns the color associated with a given subject area
function getSubjectAreaColor(subjectArea: SubjectArea) {
  const colors: { [key in SubjectArea]: string } = {
    information_systems: 'var(--color-red-500)',
    computer_science: 'var(--color-purple-500)',
    business_administration: 'var(--color-blue-500)',
    quantitative_methods: 'var(--color-green-500)',
    none: 'var(--color-gray-500)',
  }
  return colors[subjectArea] || 'bg-gray-500'
}

// Computes chart data for each subject area, including name, total ECTS, and color
const chartData = computed(() => Object.keys(applicationStore.courses).map(subjectArea => ({
  name: titleCase(subjectArea),
  value: applicationStore.courses[subjectArea as SubjectArea]
    .reduce((acc, course) => acc + course.applicantCredits, 0) || 0,
  color: getSubjectAreaColor(subjectArea as SubjectArea),
})))

// Computes the total credits across all subject areas
const totalCredits = computed(() => chartData.value.reduce((acc, item) => acc + item.value, 0))
</script>

<template>
  <div class="flex flex-row items-center justify-between gap-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold">
        Course Analysis
      </h2>

      <p class="text-sm text-muted">
        Courses are automatically assigned using artificial intelligence, but you can manually adjust them via drag and drop.
        Additionally, you can add courses manually if the AI does not recognize them correctly.
        <strong>Please note, the final responsibility lies with you, not the AI.</strong>
      </p>
    </div>

    <!-- Donut chart visualizing ECTS distribution -->
    <div class="relative">
      <ClientOnly>
        <DonutChart
          :data="chartData.map(i => i.value)"
          :height="125"
          :labels="chartData.map(e => ({ name: e.name, color: e.color }))"
          :radius="0"
          type="full"
          hide-legend
        />
        <template #fallback>
          <div class="h-[125px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-800">
                {{ totalCredits }}
              </div>
              <div class="text-sm text-gray-600 mt-1">
                Loading chart...
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Centered total ECTS value inside the donut chart -->
      <div class="absolute flex flex-col gap-1 inset-0 items-center justify-center">
        <div class="text-2xl font-semibold">
          {{ totalCredits }}
        </div>
      </div>
    </div>
  </div>
</template>
