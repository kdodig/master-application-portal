<script setup lang="ts">
import { titleCase } from 'scule'
import { VueDraggable } from 'vue-draggable-plus'

const applicationStore = useApplicationStore()
const { courses } = storeToRefs(applicationStore)

const subjectAreas = computed(() => Object.keys(courses.value).map(area => ({
  label: titleCase(area),
  key: area as SubjectArea,
})))
</script>

<template>
  <UCard class="w-full" :ui="{ body: 'flex flex-col gap-4 overflow-x-hidden' }">
    <ApplicationCoursesOverview />

    <div v-auto-animate class="overflow-x-auto w-full">
      <div v-if="applicationStore.loading" class="flex flex-col gap-2 w-full">
        <UProgress animation="swing" />
        <div class="text-center text-sm text-muted">
          Predicting courses, please wait...
        </div>
      </div>

      <div v-else class="grid grid-cols-5 gap-4 w-full">
        <div
          v-for="subjectArea in subjectAreas"
          :key="subjectArea.key"
          class="flex flex-col border border-default rounded-md min-w-48"
        >
          <div class="text-md font-medium p-2 border-b border-default flex items-center justify-between gap-1">
            <span class="truncate">{{ subjectArea.label }}</span>
            <span>{{ courses[subjectArea.key].reduce((acc, c) => acc + c.applicantCredits, 0) }}</span>
          </div>

          <VueDraggable
            v-model="courses[subjectArea.key]"
            group="courses"
            :animation="150"
            class="min-h-16 h-full p-2 flex flex-col gap-2"
          >
            <ApplicationCoursesItem
              v-for="(_, index) in courses[subjectArea.key]"
              :key="`${subjectArea}-course-${index}`"
              v-model:name="courses[subjectArea.key][index]!.applicantName"
              v-model:credits="courses[subjectArea.key][index]!.applicantCredits"
              @delete="applicationStore.removeCourse(subjectArea.key, index)"
            />
          </VueDraggable>

          <div class="p-2 pt-0 w-full">
            <ApplicationCoursesAddCourse :default-subject-area="subjectArea.key" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-4">
      <UButton icon="lucide:arrow-left" label="Back" variant="outline" @click="applicationStore.backStep()" />
      <UButton icon="lucide:arrow-right" trailing label="Continue" @click="applicationStore.advanceStep()" />
    </div>
  </UCard>
</template>
