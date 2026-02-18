import { toRefs } from 'vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import i18n from '@/i18n'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'
import { useConfirmationStore } from '@/store/confirmation'

const unsavedChanges = useUnsavedChangesStore()
const confirmationStore = useConfirmationStore()
const { isDirty } = toRefs(unsavedChanges.state)

export async function protectUnsavedChanges(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  if (isDirty.value) {
    const ok = await confirmLeave()
    if (ok) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
}

function confirmLeave() {
  return new Promise<boolean>((resolve) => {
    confirmationStore.action.confirm({
      message: i18n.global.t('common.unsavedChangedConfirmationText'),
      onConfirm: () => {
        unsavedChanges.action.disableProtection()
        resolve(true)
      },
      onCancel: () => resolve(false),
    })
  })
}
