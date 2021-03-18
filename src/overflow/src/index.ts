import { defineComponent, renderSlot, h, onMounted, ref, onUpdated, PropType } from 'vue'
import { c } from '../../shared'

const hiddenAttr = 'v-hidden'

const style = c('[v-hidden]', {
  display: 'none!important'
})

export default defineComponent({
  name: 'Overflow',
  props: {
    getTail: Function as PropType<() => HTMLElement | null>,
    updateTail: Function as PropType<(count: number) => void>
  },
  setup (props) {
    const selfRef = ref<HTMLElement | null>(null)
    const tailRef = ref<HTMLElement | null>(null)
    function deriveTail (): void {
      const {
        value: self
      } = selfRef
      const { getTail } = props
      let tail: HTMLElement | null
      if (getTail !== undefined) tail = getTail()
      else {
        tail = tailRef.value
      }
      if (self === null || tail === null) return
      if (tail.hasAttribute(hiddenAttr)) {
        tail.removeAttribute(hiddenAttr)
      }
      const { children } = self
      const containerWidth = self.offsetWidth
      const childWidths: number[] = []
      let childWidthSum = 0
      let overflow = false
      const len = self.children.length
      for (let i = 0; i < len - 1; ++i) {
        const child = children[i]
        if (overflow) {
          if (!child.hasAttribute(hiddenAttr)) {
            child.setAttribute(hiddenAttr, '')
          }
          continue
        } else if (child.hasAttribute(hiddenAttr)) {
          child.removeAttribute(hiddenAttr)
        }
        const childWidth = (child as HTMLElement).offsetWidth
        childWidthSum += childWidth
        childWidths[i] = childWidth
        if (childWidthSum > containerWidth) {
          const { updateTail } = props
          for (let j = i; j >= 0; --j) {
            const restCount = len - 1 - j
            if (updateTail !== undefined) {
              updateTail(restCount)
            } else {
              tail.textContent = `${restCount}`
            }
            const tailWidth = tail.offsetWidth
            childWidthSum -= childWidths[j]
            if (childWidthSum + tailWidth <= containerWidth) {
              overflow = true
              i = j - 1
              break
            }
          }
        }
      }
      if (!overflow) {
        tail.setAttribute(hiddenAttr, '')
      }
    }
    style.mount({
      id: 'v-overflow'
    })
    onMounted(deriveTail)
    onUpdated(deriveTail)
    return {
      selfRef,
      tailRef,
      sync: deriveTail
    }
  },
  render () {
    const { $slots } = this
    // It shouldn't have border
    return h('div', {
      class: 'v-overflow',
      ref: 'selfRef'
    }, [
      renderSlot($slots, 'default'),
      // $slots.tail should only has 1 element
      $slots.tail !== undefined
        ? $slots.tail()
        : h('span', {
          style: {
            display: 'inline-block'
          },
          ref: 'tailRef'
        })
    ])
  }
})
