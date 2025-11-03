<script setup lang="ts">
const subjectArea = defineModel<SubjectArea>({
  default: 'none',
})

const items: Array<{
  value: SubjectArea
  label: string
}> = [
  { value: 'information_systems', label: 'Information Systems' },
  { value: 'business_administration', label: 'Business Administration' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'quantitative_methods', label: 'Quantitative Methods' },
  { value: 'none', label: 'None' },
]
</script>

<template>
  <USelect
    v-model="subjectArea"
    :items="items"
    value-key="value"
    label-key="label"
    placeholder="Select Subject Area"
    class="w-full"
  />
</template>
