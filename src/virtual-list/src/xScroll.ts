import { Ref, computed, provide, ref } from 'vue'
import { useMemo } from 'vooks'
import { FinweckTree } from '../../shared'
import type { VVirtualListColumn, VVirtualListRenderCell } from './type'
import { xScrollInjextionKey } from './context'

export function setupXScroll ({
  columnsRef,
  renderCellRef
}: {
  columnsRef: Ref<VVirtualListColumn[]>
  renderCellRef: Ref<VVirtualListRenderCell | undefined>

}): {
    setListWidth: (value: number) => void
    scrollLeftRef: Ref<number>
  } {
  const listWidthRef = ref(0)
  const scrollLeftRef = ref(0)
  const xFinweckTreeRef = computed(() => {
    const columns = columnsRef.value
    if (columns.length === 0) {
      return null
    }
    const ft = new FinweckTree(columns.length, 0)
    columns.forEach((column, index) => {
      ft.add(index, column.width)
    })
    return ft
  })
  const startIndexRef = useMemo(() => {
    const xFinweckTree = xFinweckTreeRef.value
    if (xFinweckTree !== null) {
      return Math.max(xFinweckTree.getBound(scrollLeftRef.value) - 1, 0)
    } else {
      return 0
    }
  })
  const getLeft = (index: number): number => {
    const xFinweckTree = xFinweckTreeRef.value
    if (xFinweckTree !== null) {
      return xFinweckTree.sum(index)
    } else {
      return 0
    }
  }
  const endIndexRef = useMemo(() => {
    const xFinweckTree = xFinweckTreeRef.value
    if (xFinweckTree !== null) {
      return Math.min(
        xFinweckTree.getBound(scrollLeftRef.value + listWidthRef.value) + 1,
        columnsRef.value.length - 1
      )
    } else {
      return 0
    }
  })
  provide(xScrollInjextionKey, {
    startIndexRef,
    endIndexRef,
    columnsRef,
    renderCellRef,
    getLeft
  })
  return {
    setListWidth (value: number) {
      listWidthRef.value = value
    },
    scrollLeftRef
  }
}
