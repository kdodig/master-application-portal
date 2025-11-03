<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { omit } from '#ui/utils'

const props = defineProps<{
  accountId: string
}>()
const emits = defineEmits(['updated'])
const open = defineModel<boolean>('open', {
  default: false,
})

const { data: account, pending } = await useFetch<FullAccount>(() => `/api/admin/accounts/${props.accountId}`)

const state = reactive<AccountUpdateSchema>({
  id: props.accountId,
  firstName: '',
  lastName: '',
  email: '',
  active: true,
  roles: [] as Role['id'][],
})

async function onSubmit(event: FormSubmitEvent<AccountUpdateSchema>) {
  await fetchAccountUpdate({
    ...omit(event.data, ['email']),
    ...(event.data.email && event.data.email !== account.value?.email ? { email: event.data.email } : {}),
  }).then(() => {
    emits('updated')
    open.value = false
  })
}

watchEffect(() => {
  if (account.value && open.value) {
    state.id = account.value.id
    state.firstName = account.value.firstName
    state.lastName = account.value.lastName
    state.email = account.value.email
    state.active = account.value.active
    state.roles = account.value.roles?.map(role => role.id) || []
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="Edit Account"
    :description="`Edit the details of the account for ${account?.firstName} ${account?.lastName}`"
    :loading="pending"
  >
    <template #body>
      <UForm :schema="accountUpdateSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="firstName" label="First Name" required>
            <UInput v-model="state.firstName" class="w-full" />
          </UFormField>

          <UFormField name="lastName" label="Last Name" required>
            <UInput v-model="state.lastName" class="w-full" />
          </UFormField>
        </div>

        <UFormField name="email" label="E-Mail" type="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="roles" label="Roles">
            <AdminSettingsAccountsRolesSelect v-model="state.roles" />
          </UFormField>

          <UFormField name="active" label="Active">
            <USwitch v-model="state.active" />
          </UFormField>
        </div>

        <div class="flex flex-row justify-end">
          <UButton type="submit">
            Save
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
