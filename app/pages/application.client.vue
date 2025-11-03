<script setup lang="ts">
const applicationStore = useApplicationStore()
</script>

<template>
  <div v-auto-animate class="p-4 flex flex-col items-center gap-4">
    <ApplicationStepper />

    <ApplicationPersonalInformation v-if="applicationStore.step === 0" />

    <ApplicationBachelorDegree v-else-if="applicationStore.step === 1" />

    <ApplicationCourses v-else-if="applicationStore.step === 2" />

    <ApplicationDownload v-else-if="applicationStore.step === 3" />
  </div>
</template>
