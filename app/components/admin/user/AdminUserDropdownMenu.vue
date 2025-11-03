<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/components/DropdownMenu.vue'

const { user, clear } = useUserSession()

async function handleLogOut() {
  await clear()
  await navigateTo('/admin/login')
}

const items: DropdownMenuItem[][] = [
  [
    {
      label: user.value ? `${user.value.firstName} ${user.value.lastName}` : 'Account',
      type: 'label',
    },
    {
      type: 'label',
      slot: 'roles' as const,
    },
  ],
  [
    {
      label: 'Change Password',
      icon: 'lucide:key',
      to: '/admin/user/change-password',
    },
    {
      label: 'Logout',
      icon: 'lucide:log-out',
      onSelect: handleLogOut,
      class: 'cursor-pointer',
    },
  ],
]
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ content: 'w-64' }">
    <UButton variant="outline" icon="lucide:user" />

    <template #roles>
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="role in user?.roles"
          :key="role.id"
          variant="outline"
          color="neutral"
        >
          {{ role.name }}
        </UBadge>
      </div>
    </template>
  </UDropdownMenu>
</template>
