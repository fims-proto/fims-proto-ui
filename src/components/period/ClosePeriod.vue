<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSobStore } from '@store/sob'
import { useToastStore } from '@store/toast'
import { PeriodService } from '@domain/general-ledger'
import { confirm } from '../reusable/confirm-button'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const sobStore = useSobStore()
const toast = useToastStore()

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

  toast.action.add({ severity: 'success', detail: t('period.close.success') })
}
</script>

<template>
  <div>
    <p>
      {{ t('period.close.title') }}
      {{
        t('period.periodText', {
          fiscalYear: currentPeriod?.fiscalYear,
          number: currentPeriod?.periodNumber,
        })
      }}
    </p>
    <Button
      :label="t('period.close.action')"
      :message="t('period.close.confirmation')"
      @click="(e) => confirm(e, { accept: onClosePeriod })"
    />
  </div>
</template>
