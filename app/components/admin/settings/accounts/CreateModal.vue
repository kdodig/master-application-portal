<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

const emits = defineEmits(['created'])
const open = defineModel<boolean>('open', {
  default: false,
})

const state = reactive<AccountCreateSchema>({
  firstName: '',
  lastName: '',
  email: '',
  active: true,
  roles: [] as string[],
})

async function onSubmit(event: FormSubmitEvent<AccountCreateSchema>) {
  await fetchAccountCreate(event.data).then(() => {
    emits('created')
    open.value = false
  })
}
</script>

<template>
  <UModal v-model:open="open" title="Create Account" description="Create a new user account">
    <UButton icon="lucide:user-plus">
      Create Account
    </UButton>

    <template #body>
      <UForm :schema="accountCreateSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="firstName" label="First Name" required>
            <UInput v-model="state.firstName" class="w-full" />
          </UFormField>

          <UFormField name="lastName" label="Last Name" required>
            <UInput v-model="state.lastName" class="w-full" />
          </UFormField>
        </div>

        <UFormField name="email" label="E-Mail" type="email" required class="w-full">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="roles" label="Roles" required>
            <AdminSettingsAccountsRolesSelect v-model="state.roles" />
          </UFormField>

          <UFormField name="active" label="Active" type="checkbox">
            <USwitch v-model="state.active" />
          </UFormField>
        </div>

        <div class="flex justify-end">
          <UButton type="submit" color="primary">
            Create
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
