import i18n from '@i18n'
import { ConfirmationEventBus } from 'primevue'

export type ConfirmOptions = {
  message?: string
  accept: (e: Event) => void
  reject?: (e: Event) => void
}

export function confirm(e: Event, options: ConfirmOptions) {
  const { t } = i18n.global
  ConfirmationEventBus.emit('confirm', {
    target: e.currentTarget as HTMLElement,
    message: options.message ? options.message : t('common.confirmationText'),
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: t('common.confirm'),
    },
    accept: () => options.accept(e),
    reject: () => options.reject?.(e),
  })
}
