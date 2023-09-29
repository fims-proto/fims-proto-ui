<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PeriodService } from '../../domain'
import { useSobStore } from '../../store/sob'
import { toRefs } from 'vue'
import { useNotificationStore } from '../../store/notification'

const { t } = useI18n()
const sobStore = useSobStore()
const notificationStore = useNotificationStore()

const props = defineProps<{
  sobId: string
}>()

const { currentPeriod } = toRefs(sobStore.state)

const onClosePeriod = async () => {
  if (!currentPeriod.value) {
    return
  }

  const { exception } = await PeriodService.closePeriod(props.sobId, currentPeriod.value.id)
  if (exception) {
    return
  }

  sobStore.action.refreshPeriod()

  notificationStore.action.push({
    type: 'success',
    message: t('period.close.success'),
  })
}
</script>

<template>
  <BasePage
    :subtitle="
      t('period.periodText', {
        fiscalYear: currentPeriod?.fiscalYear,
        number: currentPeriod?.periodNumber,
      })
    "
  >
    <template #title>{{ t('period.close.title') }}</template>
    <template #extra>
      <BaseConfirmationButton
        category="primary"
        :confirmation-text="t('period.close.confirmation')"
        @click="onClosePeriod"
      >
        {{ t('period.close.action') }}
      </BaseConfirmationButton>
    </template>
  </BasePage>
</template>
