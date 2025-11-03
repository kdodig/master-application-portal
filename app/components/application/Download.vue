<script setup lang="ts">
const applicationStore = useApplicationStore()

const submitted = ref(false)

// Function to handle the download of the course analysis PDF
async function handleDownload() {
  if (!submitted.value) {
    await applicationStore.submitApplication()
  }
  submitted.value = true

  try {
    // Access the pdfMake instance from the Nuxt app context
    const { $pdfMake } = useNuxtApp()
    // Retrieve the document definition and table layouts from the store
    const { docDefinition, tableLayouts } = applicationStore.getPdfData()
    // Generate and download the PDF with the specified filename
    $pdfMake.createPdf(docDefinition, tableLayouts).download('curricular_analysis.pdf')
  } catch (error) {
    // Log any errors that occur during PDF generation
    console.error('Error generating PDF:', error)
    // Show a toast notification to inform the user about the error
    const toast = useToast()
    toast.add({
      title: 'PDF Generation Error',
      description: 'Could not generate the PDF. Please try again or contact support if the problem persists.',
      color: 'error',
    })
  }
}
</script>

<template>
  <UCard class="w-full max-w-screen-lg">
    <template #header>
      <h2 class="text-lg font-semibold">
        Download your PDF
      </h2>
    </template>

    <div class="flex flex-col gap-2 w-full items-start">
      <div class="text-sm text-muted">
        Next steps:
      </div>
      <ol class="list-decimal list-inside space-y-1">
        <li>Download the Course Description PDF.</li>
        <li>Upload the PDF to the Studienrendensekreteriat.</li>
        <li>Wait for a response at the end of the application period.</li>
      </ol>
      <UButton icon="lucide:download" label="Download" loading-auto @click="handleDownload" />
    </div>

    <div class="flex justify-between mt-4">
      <UButton icon="lucide:arrow-left" label="Back" variant="outline" @click="applicationStore.backStep()" />
    </div>
  </UCard>
</template>
