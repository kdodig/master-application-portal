<script setup lang="ts">
import { z } from 'zod'

const applicationStore = useApplicationStore()
const { bachelorDegree, transcript, courseDescription } = storeToRefs(applicationStore)

const fileSchema = z.object({
  transcript: z.instanceof(File, {
    message: 'Transcript is required',
  }),
  courseDescription: z.instanceof(File, {
    message: 'Course description is required',
  }),
})

const countries = computed(() => countryJson.map(country => country.name))
</script>

<template>
  <UCard class="w-full max-w-screen-lg">
    <UForm
      v-slot="{ errors }"
      :schema="bachelorDegreeCreateSchema"
      :state="bachelorDegree"
      class="flex flex-col gap-2"
      @submit="applicationStore.getCoursePredictions()"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <UFormField
          name="university"
          label="University"
          help="The university where you completed your bachelor's degree"
        >
          <ApplicationUniversitySelect v-model="bachelorDegree.university" class="w-full" />
        </UFormField>

        <UFormField
          name="country"
          label="Country"
          help="The country where your university is located"
        >
          <USelectMenu v-model="bachelorDegree.country" :items="countries" class="w-full" />
        </UFormField>
      </div>

      <UFormField
        name="bachelor"
        label="Bachelor's Course of Study"
        help="The course of study of your bachelor's degree"
      >
        <UInput v-model="bachelorDegree.courseOfStudy" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
        <UFormField
          name="courseAnalysis.worstPossibleGrade"
          label="Worst Possible Grade"
          help="The worst grade you can achieve"
        >
          <UInputNumber
            v-model="bachelorDegree.worstPossibleGrade"
            :step="0.1"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="courseAnalysis.averageGrade"
          label="Average Grade"
          help="The current grade point average"
        >
          <UInputNumber
            v-model="bachelorDegree.averageGrade"
            :step="0.1"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="courseAnalysis.bestPossibleGrade"
          label="Best Possible Grade"
          help="The best grade you can achieve"
        >
          <UInputNumber
            v-model="bachelorDegree.bestPossibleGrade"
            :step="0.1"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
        <UFormField
          name="courseAnalysis.creditsInProgram"
          label="Credits in Program"
          help="The total number of credits required to complete your bachelor's degree"
        >
          <UInputNumber v-model="bachelorDegree.creditsInProgram" class="w-full" />
        </UFormField>

        <UFormField
          name="courseAnalysis.yearsInProgram"
          label="Years in Program"
          help="The total number of years required to complete your bachelor's degree"
        >
          <UInputNumber v-model="bachelorDegree.yearsInProgram" :step="0.5" class="w-full" />
        </UFormField>
      </div>

      <UForm :state="applicationStore" :schema="fileSchema" attach>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <UFormField
            name="transcript"
            label="Transcript"
            help="Upload your transcript of records in PDF format"
          >
            <UFileUpload
              v-model="transcript"
              accept=".pdf"
              layout="list"
              position="inside"
              icon="bi:filetype-pdf"
              file-icon="bi:filetype-pdf"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="courseDescription"
            label="Course Description"
            help="Upload the course description in PDF format"
          >
            <UFileUpload
              v-model="courseDescription"
              accept=".pdf"
              layout="list"
              position="inside"
              icon="bi:filetype-pdf"
              file-icon="bi:filetype-pdf"
              class="w-full"
            />
          </UFormField>
        </div>
      </UForm>

      <div class="flex justify-between mt-4">
        <UButton icon="lucide:arrow-left" label="Back" variant="outline" @click="applicationStore.backStep()" />
        <UButton type="submit" icon="lucide:arrow-right" trailing label="Continue" :disabled="errors.length > 0" />
      </div>
    </UForm>
  </UCard>
</template>
