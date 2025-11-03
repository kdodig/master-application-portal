<script setup lang="ts">
async function handleCsvDownload() {
  const data = await $fetch('/api/admin/applicants/csv')

  if (!data?.length && data.length < 1) {
    return
  }

  const firstEntry = data[0]

  const headers = Object.keys(firstEntry!).map(key => `"${key.replace(/"/g, '""')}"`).join(',')
  const rows = data.map((row: Record<string, any>) => {
    return Object.values(row).map((value) => {
      const stringValue = value === null || value === undefined ? '' : String(value)
      return `"${stringValue.replace(/"/g, '""')}"`
    }).join(',')
  }).join('\n')

  const csvContent = `${headers}\n${rows}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const today = new Date().getTime().toString()
  link.setAttribute('download', `applicants_${today}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <UButton
    icon="lucide:download"
    label="Download CSV"
    loading-auto
    @click="handleCsvDownload"
  />
</template>
