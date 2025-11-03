<script setup lang="ts">
import type { TableColumn } from '#ui/components/Table.vue'
import { fetchAccountUpdate } from '~/utils'

interface AccountWithCreatingAccount extends FullAccount {
  createdByFirstName?: string
  createdByLastName?: string
}

const {
  data: accounts,
  refresh: refreshAccounts,
  status,
} = await useFetch<AccountWithCreatingAccount[]>('/api/admin/accounts', {
  key: 'admin-accounts',
  default: () => [],
})

const accountEditState = reactive({
  open: false,
  accountId: '',
})

const showDeleteModal = ref(false)
const selectedAccount = ref<AccountWithCreatingAccount>()

const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

async function handleDelete() {
  if (!selectedAccount.value) {
    return
  }
  await fetchAccountDelete(selectedAccount.value.id)
  selectedAccount.value = undefined
  showDeleteModal.value = false
  await refreshAccounts()
}

function rowActionItems(row: AccountWithCreatingAccount) {
  return [
    {
      type: 'label',
      label: `${row.firstName} ${row.lastName}`,
    },
    {
      type: 'separator',
    },
    {
      label: 'Edit',
      icon: 'lucide:pencil',
      onClick: () => {
        accountEditState.accountId = row.id
        accountEditState.open = true
      },
    },
    {
      label: row.active ? 'Deactivate' : 'Activate',
      icon: row.active ? 'lucide:lock' : 'lucide:lock-open',
      onClick: async () => {
        await fetchAccountUpdate({
          id: row.id,
          active: !row.active,
        })
        await refreshAccounts()
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Delete',
      icon: 'lucide:trash-2',
      color: 'error',
      onClick: async () => {
        selectedAccount.value = row
        showDeleteModal.value = true
      },
    },
  ]
}

const columns: TableColumn<AccountWithCreatingAccount>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => sortingHeader(column, 'First Name'),
    enableSorting: true,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => sortingHeader(column, 'Last Name'),
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => sortingHeader(column, 'E-Mail'),
    enableSorting: true,
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => sortingHeader(column, 'Created By'),
    enableSorting: true,
    cell: ({ row }) => {
      const account = row.original
      return account.createdByFirstName && account.createdByLastName
        ? `${account.createdByFirstName} ${account.createdByLastName}`
        : 'System'
    },
  },
  {
    accessorKey: 'active',
    header: ({ column }) => sortingHeader(column, 'Active'),
    enableSorting: true,
    cell: ({ row }) => h(
      UBadge,
      {
        color: row.original.active ? 'success' : 'error',
        variant: 'subtle',
        class: 'w-16 justify-center',
      },
      () => row.original.active ? 'Active' : 'Inactive',
    ),
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => h(
      'span',
      { class: 'flex gap-1' },
      row.original.roles.map(role => h(UBadge, { color: 'neutral', variant: 'outline' }, () => role.name)),
    ),
    meta: {
      class: {
        th: 'text-left',
        td: 'text-left',
      },
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => sortingHeader(column, 'Created At'),
    enableSorting: true,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right',
      },
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        items: rowActionItems(row.original),
        content: { align: 'end' },
        ui: { content: 'w-48' },
      },
      () => h(
        UButton,
        {
          variant: 'ghost',
          size: 'sm',
          icon: 'lucide:ellipsis-vertical',
        },
      ),
    ),
  },
]

const search = ref('')
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex p-4 border-b border-accented items-end justify-between gap-4 shrink-0">
      <UInput v-model="search" placeholder="Search accounts..." icon="lucide:search" class="w-64" />

      <AdminSettingsAccountsCreateModal @created="refreshAccounts" />
    </div>

    <div class="flex-1 overflow-hidden">
      <ClientOnly>
        <UTable
          v-model:global-filter="search"
          :data="accounts"
          :columns="columns"
          :loading="status === 'pending'"
          :sorting-options="{
            enableMultiSort: true,
          }"
          sticky
          class="h-full"
        />
      </ClientOnly>
    </div>

    <AdminSettingsAccountsEditModal
      v-model:open="accountEditState.open"
      :account-id="accountEditState.accountId"
      @updated="refreshAccounts"
    />

    <UModal
      v-model:open="showDeleteModal"
      title="Delete Application"
      :description="`Are you sure you want to delete ${selectedAccount?.firstName || ''} ${selectedAccount?.lastName || ''}'s account? This action cannot be undone.`"
    >
      <template #body>
        <div class="flex items-center justify-end gap-4">
          <UButton
            variant="outline"
            color="neutral"
            icon="lucide:x"
            label="Cancel"
            @click="showDeleteModal = false"
          />
          <UButton
            v-if="selectedAccount"
            color="error"
            icon="lucide:trash-2"
            label="Delete"
            loading-auto
            @click="handleDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
