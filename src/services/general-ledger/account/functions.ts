import { useSobStore } from '@/store/sob'
import { ref, toRefs, watchEffect } from 'vue'
import { toValue } from 'vue'

export function usePadLevelNumber(levelNumber: () => number, level: () => number) {
  const res = ref()
  const { workingSob } = toRefs(useSobStore().state)

  watchEffect(() => {
    if (!workingSob.value) {
      res.value = ''
      return
    }

    const ln = toValue(levelNumber)
    const l = toValue(level)
    const codeLengths = workingSob.value.accountsCodeLength

    if (l > codeLengths.length) {
      console.error(`level ${l} exceeds account max depth ${codeLengths.length}`)
      res.value = ''
      return
    }

    if (ln === 0) {
      res.value = ln.toString()
      return
    }

    res.value = String(ln).padStart(codeLengths[l - 1] ?? 0, '0')
  })

  return res
}
