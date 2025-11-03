<template>
  <UCalendar
    v-model="date"
    @dayclick="onDayClick"
    color="neutral"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [Date, Object],
    default: null
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

function onDayClick(_: any, event: MouseEvent): void {
  const target = event.target as HTMLElement
  target.blur()
}
</script>


<style>

</style>
