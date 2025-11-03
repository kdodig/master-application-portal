<script setup lang="ts">
import { titleCase } from 'scule'

const documentStatus = defineModel<DocumentStatus>({
  default: 'missing',
})

const items = ['missing', 'unclear', 'existing'].map(status => ({
  label: titleCase(status),
  value: status,
}))

const color = computed(() => ({
  missing: 'error',
  unclear: 'warning',
  existing: 'success',
}[documentStatus.value]))
</script>

<template>
  <URadioGroup
    v-model="documentStatus"
    :items="items"
    value-key="value"
    label-key="label"
    orientation="horizontal"
    variant="table"
    :color="color"
  />
</template>
