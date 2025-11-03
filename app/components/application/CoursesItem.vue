<script setup lang="ts">
const emits = defineEmits('delete')

// Define the Course model for two-way binding
const name = defineModel<string>('name')
const credits = defineModel<number>('credits')

// Reactive state to toggle edit mode
const edit = ref(false)

function onDelete() {
  emits('delete')
}
</script>

<template>
  <UCard :ui="{ root: 'cursor-grab', body: 'p-2 sm:p-2' }">
    <div class="flex flex-col">
      <div class="font-semibold whitespace-nowrap truncate text-sm">
        {{ name || 'Course Name' }}
      </div>

      <div class="flex flex-row gap-1 justify-between items-center">
        <p class="text-xs text-muted">
          {{ credits || 0 }} Credits
        </p>

        <UButton
          variant="ghost"
          size="xs"
          icon="lucide:chevron-down"
          @click="edit = !edit"
        />
      </div>

      <UCollapsible v-model:open="edit" class="w-full">
        <template #content>
          <div class="flex flex-col gap-2 w-full">
            <UFormField label="Name">
              <UInput v-model="name" size="sm" placeholder="Course Name" class="w-full" />
            </UFormField>
            <UFormField label="Credits">
              <UInputNumber v-model="credits" size="sm" :step="0.5" placeholder="Credits" class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-1 w-full">
              <UButton
                class="justify-center"
                size="xs"
                variant="outline"
                color="error"
                @click="onDelete"
              >
                Delete
              </UButton>
              <UButton class="justify-center" size="xs" @click="edit = false">
                Save
              </UButton>
            </div>
          </div>
        </template>
      </UCollapsible>
    </div>
  </UCard>
</template>
