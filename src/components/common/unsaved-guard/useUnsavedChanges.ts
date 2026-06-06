import { ref } from 'vue'
import type { Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export function useUnsavedChanges(isDirty: Ref<boolean>) {
  const confirmOpen = ref(false)
  let resolvePending: ((ok: boolean) => void) | null = null

  onBeforeRouteLeave(async (_to, _from, next) => {
    if (!isDirty.value) {
      next()
      return
    }
    confirmOpen.value = true
    const ok = await new Promise<boolean>((resolve) => {
      resolvePending = resolve
    })
    confirmOpen.value = false
    next(ok ? undefined : false)
  })

  function onConfirmLeave() {
    resolvePending?.(true)
    resolvePending = null
  }

  function onCancelLeave() {
    resolvePending?.(false)
    resolvePending = null
  }

  return { confirmOpen, onConfirmLeave, onCancelLeave }
}
