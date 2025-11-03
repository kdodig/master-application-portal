<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const { fetch: refreshUserSession } = useUserSession()

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: '',
})

// errors from server
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  errorMessage.value = null
  isLoading.value = true

  await $fetch('/api/auth/login', {
    method: 'POST',
    body: event.data,
  }).then(async () => {
    await refreshUserSession()
    await navigateTo('/admin')
  }).catch((error) => {
    errorMessage.value = error?.statusMessage || error?.message || 'An unexpected error occurred.'
  })

  isLoading.value = false
}
</script>

<template>
  <div class="flex grow flex-col items-center justify-center p-4 lg:py-8 xl:py-12">
    <UCard :ui="{ body: 'flex flex-col gap-4 items-center justify-center p-6' }" class="w-full max-w-sm">
      <NuxtImg src="/wwu-logo.svg" alt="Logo" class="mb-4 w-full" />

      <UForm :schema="schema" :state="state" class="space-y-2 w-full" @submit="onSubmit">
        <UFormField label="E-Mail" name="email">
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" icon="lucide:log-in" :loading="isLoading" class="w-full justify-center">
          Login
        </UButton>
      </UForm>

      <div v-if="errorMessage" class="text-error-500 text-xs">
        Sorry, something went wrong: {{ errorMessage }}
      </div>
    </UCard>
  </div>
</template>
