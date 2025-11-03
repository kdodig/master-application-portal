<script setup lang="ts">
// Access the application store for state management
const applicationStore = useApplicationStore()

// Define the steps for the stepper component
const stepperItems = [
  {
    title: 'Personal information',
  },
  {
    title: 'Bachelor degree',
  },
  {
    title: 'Bachelor\'s courses',
  },
  {
    title: 'Download',
  },
]
</script>

<template>
  <!-- Stepper component to visualize the current step in the process -->
  <UStepper
    :model-value="applicationStore.step"
    :items="stepperItems"
    disabled
    size="lg"
    class="w-full max-w-screen-lg"
  />
</template>
