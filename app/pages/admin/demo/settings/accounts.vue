<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue'

const accounts = ref<any[]>([
  { id: 'u1', firstName: 'Alice', lastName: 'Admin', email: 'alice@example.com', active: true, roles: [{ name: 'admin' }], createdAt: new Date().toISOString() },
  { id: 'u2', firstName: 'Bob', lastName: 'User', email: 'bob@example.com', active: true, roles: [{ name: 'user' }], createdAt: new Date().toISOString() },
  { id: 'u3', firstName: 'Gina', lastName: 'Guest', email: 'gina@example.com', active: false, roles: [{ name: 'guest' }], createdAt: new Date().toISOString() },
])

const accountEditState = reactive({
  open: false,
  accountId: '',
})

const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

function rowActionItems(row: any) {
  return [
    { type: 'label', label: `${row.firstName} ${row.lastName}` },
    { type: 'separator' },
    { label: 'Edit', icon: 'lucide:pencil', onClick: () => { accountEditState.accountId = row.id; accountEditState.open = true } },
    { label: row.active ? 'Deactivate' : 'Activate', icon: row.active ? 'lucide:lock' : 'lucide:lock-open' },
    { type: 'separator' },
    { label: 'Delete', icon: 'lucide:trash-2', color: 'error' },
  ]
}

const columns: TableColumn<any>[] = [
  { accessorKey: 'firstName', header: ({ column }) => sortingHeader(column, 'First Name'), enableSorting: true },
  { accessorKey: 'lastName', header: ({ column }) => sortingHeader(column, 'Last Name'), enableSorting: true },
  { accessorKey: 'email', header: ({ column }) => sortingHeader(column, 'E-Mail'), enableSorting: true },
  {
    accessorKey: 'active',
    header: ({ column }) => sortingHeader(column, 'Active'),
    enableSorting: true,
    cell: ({ row }) => h(
      UBadge,
      { color: row.original.active ? 'success' : 'error', variant: 'subtle', class: 'w-16 justify-center' },
      () => row.original.active ? 'Active' : 'Inactive',
    ),
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => h(
      'span',
      { class: 'flex gap-1' },
      row.original.roles.map((role: any) => h(UBadge, { color: 'neutral', variant: 'outline' }, () => role.name)),
    ),
    meta: { class: { th: 'text-left', td: 'text-left' } },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => sortingHeader(column, 'Created At'),
    enableSorting: true,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    meta: { class: { th: 'text-right', td: 'text-right' } },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(
      UDropdownMenu,
      { items: rowActionItems(row.original), content: { align: 'end' }, ui: { content: 'w-48' } },
      () => h(UButton, { variant: 'ghost', size: 'sm', icon: 'lucide:ellipsis-vertical' }),
    ),
  },
]

const search = ref('')
</script>

<template>
  <div class="flex flex-col p-4 h-full">
    <UCard class="flex-1 overflow-hidden h-full flex flex-col" :ui="{ body: 'overflow-hidden grow-0 flex flex-col gap-2' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">User Accounts (Demo)</h2>
        </div>
      </template>

      <div class="flex items-center justify-between">
        <UInput v-model="search" placeholder="Search accounts..." icon="lucide:search" class="w-64" />
      </div>

      <ClientOnly>
        <UTable
          v-model:global-filter="search"
          :data="accounts"
          :columns="columns"
          :sorting-options="{ enableMultiSort: true }"
          sticky
          class="flex-1 max-h-full"
        />
      </ClientOnly>
    </UCard>
  </div>
</template>

