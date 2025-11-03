<script setup lang="ts">
const roles = defineModel<Role['id'][]>('roles', {
  default: [],
})

const { data: allRoles, pending } = await useFetch('/api/admin/roles', {
  key: 'admin-roles',
  default: () => [],
})
</script>

<template>
  <USelect
    v-model="roles"
    :items="allRoles"
    value-key="id"
    label-key="name"
    multiple
    :loading="pending"
    placeholder="Select roles"
    class="w-full"
  />
</template>
