<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { titleCase } from 'scule'
import { z } from 'zod'

const props = defineProps<{
  defaultSubjectArea?: SubjectArea
}>()

const applicationStore = useApplicationStore()

const open = ref(false)

const schema = z.object({
  applicantName: z.string().min(1, 'Name is required'),
  applicantCredits: z.number()
    .min(0.5, 'Credits must be at least 0.5')
    .max(60, 'Credits must be at most 60'),
  applicantSubjectArea: z.enum(subjectAreaEnum.enumValues),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  applicantName: '',
  applicantCredits: 6,
  applicantSubjectArea: props.defaultSubjectArea || subjectAreaEnum.enumValues[0],
})

const subjectAreaItems = computed(() => subjectAreaEnum.enumValues.map(area => ({
  label: titleCase(area),
  value: area,
})))

function addCourse(event: FormSubmitEvent<Schema>) {
  applicationStore.addCourse({
    ...event.data,
    reviewedName: event.data.applicantName,
    reviewedCredits: event.data.applicantCredits,
    reviewedSubjectArea: event.data.applicantSubjectArea,
  })
  open.value = false
  state.applicantName = ''
  state.applicantCredits = 0
  state.applicantSubjectArea = props.defaultSubjectArea || subjectAreaEnum.enumValues[0]
}
</script>

<template>
  <UModal v-model:open="open" title="Add Course">
    <UButton variant="outline" size="sm" color="neutral" class="w-full justify-center">
      <Icon name="lucide:plus" class="size-4" />
    </UButton>

    <template #body>
      <UForm :state="state" :schema="schema" class="flex flex-col gap-4" @submit="addCourse">
        <UFormField name="applicantName" label="Course Name">
          <UInput v-model="state.applicantName" placeholder="Course Name" class="w-full" />
        </UFormField>

        <UFormField name="applicantCredits" label="Credits">
          <UInputNumber v-model="state.applicantCredits" :step="0.5" placeholder="Credits" class="w-full" />
        </UFormField>

        <UFormField name="applicantSubjectArea" label="Subject Area">
          <USelect
            v-model="state.applicantSubjectArea"
            :items="subjectAreaItems"
            label-key="label"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" class="justify-center">
            Add Course
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
