<!-- components/PDFViewer.vue -->
<template>
  <div>
    <iframe
        v-if="fileUrl"
        width="800"
        height="600"
        :src="`${fileUrl}#page=${page}`"
    ></iframe>
    <div v-else>PDF wird geladen...</div>
  </div>
</template>

<script>
export default {
  name: 'PDFViewer',
  props: {
    initialPage: {
      type: Number,
      default: 1
    },
    fileType: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      fileUrl: null,
      page: this.initialPage
    }
  },
  async mounted() {
    const objectName = `${this.fileType}/${this.fileName}`
    try {
      const res = await fetch(`/api/upload/pdfUrl?filename=${encodeURIComponent(objectName)}`)
      const data = await res.json()
      this.fileUrl = data.url
    } catch (error) {
      console.error('Fehler beim Laden der Presigned URL:', error)
    }
  }
}
</script>
