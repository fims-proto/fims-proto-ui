import { watch, type MaybeRefOrGetter, toValue, type WatchStopHandle, ref } from 'vue'

const modals = new Map<string, boolean>()
const modalWatchStopHandles = new Map<string, WatchStopHandle>()
const consolidatedStatus = ref(false)

const consolidateStatus = () => {
  consolidatedStatus.value = false // reset
  modals.forEach((status) => (consolidatedStatus.value = consolidatedStatus.value || status))
}

export function registerModal(key: string, status: MaybeRefOrGetter<boolean>) {
  modalWatchStopHandles.set(
    key,
    watch(
      () => toValue(status),
      () => {
        modals.set(key, toValue(status))
        consolidateStatus()
      },
      { immediate: true },
    ),
  )
}

export function unregisterModal(key: string) {
  modalWatchStopHandles.get(key)?.()
  modalWatchStopHandles.delete(key)
  modals.delete(key)

  consolidateStatus()
}

watch(
  consolidatedStatus,
  (status, oldStatus) => {
    if (!oldStatus && status) {
      // has modal(s) opened
      document.body.style.overflow = 'hidden'
    }
    if (oldStatus && !status) {
      // all modal closed
      document.body.style.overflow = 'auto'
    }
  },
  { immediate: true },
)
