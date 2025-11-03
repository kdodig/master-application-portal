<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const { data: settings } = await useFetch('/api/admin/settings', {
  key: 'admin-application-period',
  method: 'get',
})

const schema = z.object({
  applicationPeriodStart: z.string().datetime(),
  applicationPeriodEnd: z.string().datetime(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  applicationPeriodStart: '',
  applicationPeriodEnd: '',
})

const { add } = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch('/api/admin/settings', {
    method: 'post',
    body: event.data,
    onResponse: ({ response }) => {
      if (response.ok) {
        add({
          title: 'Settings saved successfully',
          color: 'success',
        })
      } else {
        add({
          title: 'Failed to save settings',
          color: 'error',
          description: response.statusText,
        })
      }
    },
  })
}

watch(settings, (newSettings) => {
  if (newSettings) {
    state.applicationPeriodStart = newSettings.applicationPeriodStart || ''
    state.applicationPeriodEnd = newSettings.applicationPeriodEnd || ''
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4 h-full">
    <UCard class="w-full max-w-lg">
      <template #header>
        <h2 class="text-lg font-semibold">
          Application Period
        </h2>
      </template>

      <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField name="applicationPeriodStart" label="Application Period Start">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="lucide:calendar" class="w-full">
              {{ state.applicationPeriodStart
                ? new Date(state.applicationPeriodStart).toLocaleDateString() : 'Select start date' }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="state.applicationPeriodStart"
                class="p-2"
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField name="applicationPeriodEnd" label="Application Period End">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="lucide:calendar" class="w-full">
              {{ state.applicationPeriodEnd
                ? new Date(state.applicationPeriodEnd).toLocaleDateString() : 'Select end date' }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="state.applicationPeriodEnd"
                class="p-2"
              />
            </template>
          </UPopover>
        </UFormField>

        <div class="flex flex-row justify-end">
          <UButton type="submit" color="primary" icon="lucide:save">
            Save Settings
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
