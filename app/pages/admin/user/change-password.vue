<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const { user, clear } = useUserSession()

const schema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New password and confirmation do not match.',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const { add } = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch('/api/admin/user/change-password', {
    method: 'POST',
    body: event.data,
  }).then(async () => {
    add({
      title: 'Password Changed',
      description: 'Your password has been successfully changed. Please log in again.',
      color: 'success',
    })
    await clear()
    await navigateTo('/admin/login')
  }).catch((error) => {
    add({
      title: 'Error',
      description: error?.statusMessage || error?.message || 'An unexpected error occurred.',
      color: 'error',
    })
  })
}
</script>

<template>
  <div class="flex grow flex-col items-center justify-center p-4 lg:py-8 xl:py-12">
    <UCard :ui="{ body: 'flex flex-col gap-4 items-center justify-center p-6' }" class="w-full max-w-sm">
      <template #header>
        <h1 class="text-xl font-bold">
          Change Password
        </h1>
      </template>

      <UAlert
        v-if="user?.isPasswordTemporary"
        color="info"
        icon="lucide:info"
        title="Temporary Password"
        description="Please change your password to start using your account."
      />

      <UForm :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
        <UFormField label="Current Password" name="currentPassword">
          <UInput v-model="state.currentPassword" type="password" class="w-full" />
        </UFormField>

        <UFormField label="New Password" name="newPassword">
          <UInput v-model="state.newPassword" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Confirm New Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" class="w-full justify-center">
          Submit
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
