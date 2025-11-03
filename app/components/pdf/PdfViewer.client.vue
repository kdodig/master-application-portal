<script setup lang="ts">
import { usePDF, VuePDF } from '@tato30/vue-pdf'

const props = defineProps<{
  src: string
  options?: Record<string, any>
}>()
const pageNum = defineModel<number | undefined>('page')

const { pdf, pages } = usePDF(props.src, props.options)

const renderedPages = ref<InstanceType<typeof VuePDF>[]>([])

function scrollToPage(page?: number) {
  if (page && renderedPages.value?.length >= page && page > 0) {
    renderedPages.value[page - 1]?.$el.scrollIntoView({ behavior: 'smooth' })
  }
}

watch(pageNum, scrollToPage)

const container = useTemplateRef('container')
const { width: containerWidth } = useElementSize(container)
const debouncedWidth = debouncedRef(containerWidth, 200)
watch(debouncedWidth, () => {
  renderedPages.value.forEach(page => page.reload())
})
</script>

<template>
  <div ref="container" class="rounded-md border border-default h-full w-full overflow-auto bg-muted flex flex-col">
    <template v-for="page in pages" :key="page">
      <VuePDF
        :id="page"
        ref="renderedPages"
        :pdf="pdf"
        :page="page"
        fit-parent
      />
    </template>
  </div>
</template>
