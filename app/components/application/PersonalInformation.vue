<script setup lang="ts">
import { titleCase } from 'scule'

const applicationStore = useApplicationStore()
const { applicant } = storeToRefs(applicationStore)

const masterTrackItems = computed(() => masterTrackEnum.enumValues.map(track => ({
  label: titleCase(track),
  value: track,
})))

const route = useRoute()

onMounted(() => {
  const applicantNumber = route.query.applicantNumber as string | undefined
  if (applicantNumber) {
    applicant.value.applicantNumber = applicantNumber
  }
})
</script>

<template>
  <UCard class="w-full max-w-screen-lg">
    <UForm
      v-slot="{ errors }"
      :schema="applicantCreateSchema"
      :state="applicant"
      class="flex flex-col gap-4"
      @submit="applicationStore.advanceStep()"
    >
      <UFormField
        name="applicantNumber"
        label="Applicant Number"
        help="The number you received during your application process"
      >
        <UInput v-model="applicant.applicantNumber" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <UFormField
          name="firstName"
          label="First Name"
          help="Your given name(s) as stated in your passport or ID"
        >
          <UInput v-model="applicant.firstName" class="w-full" />
        </UFormField>
        <UFormField
          name="lastName"
          label="Last Name"
          help="Your family name(s) as stated in your passport or ID"
        >
          <UInput v-model="applicant.lastName" class="w-full" />
        </UFormField>
      </div>

      <UFormField
        name="masterTrack"
        label="Master Track"
        help="Select the master's track you are applying for"
      >
        <URadioGroup
          v-model="applicant.masterTrack"
          :items="masterTrackItems"
          orientation="horizontal"
          variant="card"
          class="w-full"
          :ui="{ fieldset: 'grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4' }"
        />
      </UFormField>

      <div class="flex justify-end mt-4">
        <UButton
          type="submit"
          icon="lucide:arrow-right"
          trailing
          label="Continue"
          :disabled="errors.length > 0"
        />
      </div>
    </UForm>
  </UCard>
</template>
