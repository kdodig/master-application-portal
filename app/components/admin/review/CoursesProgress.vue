<script setup lang="ts">
import { titleCase } from 'scule'

const props = defineProps<{
  courses: Course[]
}>()

function getSubjectAreaColor(subjectArea: SubjectArea) {
  const colors: { [key in SubjectArea]: string } = {
    information_systems: 'bg-red-500',
    computer_science: 'bg-purple-500',
    business_administration: 'bg-blue-500',
    quantitative_methods: 'bg-green-500',
    none: 'bg-gray-500',
  }
  return colors[subjectArea] || 'bg-gray-500'
}

const donuts = computed(() => {
  const totalCredits = props.courses
    .filter(c => c.reviewedSubjectArea !== 'none')
    .reduce((acc, course) => acc + course.applicantCredits, 0) || 0
  const totalDonut = {
    label: 'Total',
    value: totalCredits,
    max: 72,
    color: 'var(--ui-primary)',
  }

  const subjectAreaDonuts = subjectAreaEnum.enumValues.filter(sa => sa !== 'none').map(subjectArea => ({
    label: titleCase(subjectArea),
    value: props.courses
      .filter(course => course.reviewedSubjectArea === subjectArea)
      .reduce((acc, course) => acc + course.applicantCredits, 0) || 0,
    max: 24,
    color: getSubjectAreaColor(subjectArea as SubjectArea),
  }))

  return [totalDonut, ...subjectAreaDonuts]
})
</script>

<template>
  <div class="grid grid-cols-5 gap-4 px-4">
    <UFormField
      v-for="(donut, index) in donuts"
      :key="`donut-${index}`"
      :label="donut.label"
      class="border border-default rounded-lg p-2"
    >
      <UProgress
        :model-value="donut.value"
        :max="donut.max"
        :get-value-text="(value, max) => `${value || 0} / ${max}`"
        :get-value-label="(value, max) => `${value || 0} / ${max}`"
        status
        :ui="{ indicator: `${donut.color}` }"
      >
        <template #status>
          {{ donut.value || 0 }} / {{ donut.max }}
        </template>
      </UProgress>
    </UFormField>
  </div>
</template>
