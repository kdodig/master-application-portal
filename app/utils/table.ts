import type { Column } from '@tanstack/vue-table'
import { UIcon } from '#components'

export function sortingHeader<T>(column: Column<T>, label: string) {
  return h(
    'span',
    {
      class: 'inline-flex items-center cursor-pointer',
      onClick: event => column.getToggleSortingHandler()?.(event),
    },
    [
      label,
      h(UIcon, {
        name: column.getIsSorted()
          ? (column.getIsSorted() === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down')
          : 'lucide:chevrons-up-down',
        class: 'ms-2 size-4',
      }),
    ],
  )
}
