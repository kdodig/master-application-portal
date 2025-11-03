<script setup lang="ts">
import type { BadgeProps } from '#ui/components/Badge.vue'
import { titleCase } from 'scule'

const props = defineProps<{
  status: ReviewStatus
}>()

const statusColors: Record<ReviewStatus, BadgeProps['color']> = {
  documents: 'info',
  course_analysis: 'primary',
  personal_skills: 'warning',
  done: 'success',
  rejected: 'error',
}

const statusIcons: Record<ReviewStatus, string> = {
  documents: 'lucide:file-text',
  course_analysis: 'lucide:graduation-cap',
  personal_skills: 'lucide:user-check',
  done: 'lucide:check',
  rejected: 'lucide:x',
}
</script>

<template>
  <UBadge
    :icon="statusIcons[props.status]"
    :label="titleCase(props.status)"
    :color="statusColors[props.status]"
    variant="subtle"
  />
</template>
