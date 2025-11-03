<script setup lang="ts">
import { UTextarea } from '#components'
import { titleCase } from 'scule'
import { ref } from 'vue'
import { z } from 'zod'

const props = defineProps<{
  applicant: FullApplicant
}>()
const emits = defineEmits(['update', 'continue'])

const addSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  points: z.number().min(0, 'Points must be at least 0').max(25, 'Points cannot exceed 25'),
})

type ApplicantPersonalSkills = z.output<typeof addSchema>

const addState = reactive<ApplicantPersonalSkills>({
  description: '',
  points: 0,
})

const skills = ref<Array<ApplicantPersonalSkills | PersonalSkillWithCreator>>(props.applicant.personalSkills || [])

function addSkill() {
  skills.value = [...skills.value, { ...addState }]
  addState.description = ''
  addState.points = 0
  setTimeout(() => {
    focusDescription()
  }, 100) // Focus after a short delay to ensure the form is ready
}

function removeSkill(index: number) {
  skills.value.splice(index, 1)
}

// Autofocus the description textarea after adding a skill
const descriptionTextarea = useTemplateRef('descriptionTextarea')

function focusDescription() {
  if (descriptionTextarea.value) {
    descriptionTextarea.value.textareaRef?.focus()
  }
}

const { add } = useToast()

async function saveSkills() {
  await $fetch(`/api/admin/applicants/${props.applicant.id}/personal-skills`, {
    method: 'POST',
    body: skills.value,
    onResponse: ({ response }) => {
      if (response.ok) {
        emits('update')
        add({
          icon: 'lucide:check',
          title: 'Personal skills saved successfully',
          description: `Personal skills for ${props.applicant.firstName} ${props.applicant.lastName} have been saved.`,
          color: 'success',
        })
      } else {
        add({
          icon: 'lucide:x',
          title: 'Failed to save personal skills',
          color: 'error',
        })
      }
    },
  })
}

async function doneWithApplicant() {
  await saveSkills()

  await $fetch(`/api/admin/applicants/${props.applicant.id}`, {
    method: 'POST',
    body: {
      reviewStatus: 'done',
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        emits('update')
        emits('continue')
        add({
          icon: 'lucide:check',
          title: 'Applicant status updated to done',
          description: `${props.applicant.firstName} ${props.applicant.lastName} has been marked as done.`,
          color: 'success',
        })
      } else {
        add({
          icon: 'lucide:x',
          title: 'Failed to update applicant status',
          color: 'error',
        })
      }
    },
  })
}

watch(() => props.applicant, (newApplicant) => {
  skills.value = newApplicant.personalSkills || []
}, { immediate: true, deep: true })
</script>

<template>
  <div class="flex flex-col flex-1 w-full gap-4">
    <div class="flex items-center gap-4 justify-between">
      <div class="flex items-baseline gap-4 text-sm">
        <div class="font-semibold text-xl">
          {{ props.applicant.firstName }} {{ props.applicant.lastName }}
        </div>
        <div>Applicant Number: {{ props.applicant.applicantNumber }}</div>
        <div>UUID: {{ props.applicant.id }}</div>
        <div>Major: {{ titleCase(props.applicant.masterTrack) }}</div>
      </div>

      <div class="flex items-center gap-2">
        <UButton icon="lucide:save" label="Save" @click="saveSkills" />
        <UButton icon="lucide:check" label="Done" color="success" @click="doneWithApplicant" />
      </div>
    </div>

    <div v-auto-animate class="flex flex-col gap-4">
      <UCard v-for="(skill, index) in skills" :key="index" :ui="{ body: 'p-4!' }">
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="font-semibold">
              {{ skill.description }}
            </div>
            <div class="text-sm text-muted">
              Points: {{ skill.points }}
            </div>
            <div v-if="skill.createdBy" class="text-xs text-muted">
              Created by: {{ skill.createdByFirstName }} {{ skill.createdByLastName }}
            </div>
          </div>
          <UButton icon="lucide:trash-2" color="error" @click="removeSkill(index)" />
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-4!' }">
        <UForm :schema="addSchema" :state="addState" class="flex flex-col gap-2" @submit="addSkill">
          <UFormField name="description" label="Description">
            <UTextarea
              ref="descriptionTextarea"
              v-model="addState.description"
              placeholder="Enter skill description"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-end gap-2 w-full justify-between">
            <UFormField name="points" label="Points">
              <UInput
                v-model.number="addState.points"
                type="number"
                placeholder="0-15"
                min="0"
                max="15"
                class="w-48"
              />
            </UFormField>
            <UButton type="submit" color="primary" icon="lucide:plus">
              Add Skill
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
