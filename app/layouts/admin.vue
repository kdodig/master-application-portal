<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/components/NavigationMenu.vue'

const { loggedIn } = useUserSession()

const routes: NavigationMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'lucide:home',
    to: '/admin',
    exact: true,
  },
  {
    label: 'Applications',
    icon: 'lucide:folder-search',
    children: [
      {
        label: 'All Applications',
        description: 'View all applications.',
        icon: 'lucide:list',
        to: '/admin/applicants',
        exact: true,
      },
      {
        label: '1. Documents Review',
        description: 'Review the documents provided by the applicant.',
        icon: 'lucide:file-text',
        to: '/admin/review/documents',
        exact: true,
      },
      {
        label: '2. Courses Review',
        description: 'Review the courses of the applicant.',
        icon: 'lucide:graduation-cap',
        to: '/admin/review/course-analysis',
        exact: true,
      },
      {
        label: '3. Personal Skills Review',
        description: 'Evaluate the personal skills of the applicant.',
        icon: 'lucide:user-check',
        to: '/admin/review/personal-skills',
        exact: true,
      },
    ],
  },
  {
    label: 'Settings',
    icon: 'lucide:settings',
    children: [
      {
        label: 'Accounts',
        description: 'Manage user accounts and permissions.',
        icon: 'lucide:user',
        to: '/admin/settings/accounts',
        exact: true,
      },
      {
        label: 'Application Settings',
        description: 'Configure application settings.',
        icon: 'lucide:cog',
        to: '/admin/settings',
        exact: true,
      },
    ],
  },
]
</script>

<template>
  <LayoutRoot>
    <LayoutNavbar>
      <template v-if="loggedIn">
        <UNavigationMenu :items="routes" content-orientation="vertical" :ui="{ viewport: 'z-[2]' }" />

        <div class="flex items-center gap-2">
          <AdminSearch />
          <AdminUserDropdownMenu />
        </div>
      </template>
    </LayoutNavbar>

    <LayoutBody>
      <LayoutContent>
        <slot />
      </LayoutContent>
    </LayoutBody>
  </LayoutRoot>
</template>
