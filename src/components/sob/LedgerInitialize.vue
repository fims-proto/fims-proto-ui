<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LedgerService, SobService, type Ledger, type Period, type Sob } from '../../domain'
import { convert, type TreeNode } from '../reusable/tree'
import { useToastStore } from '../../store/toast'

type LedgerRow = Ledger & {
  openingBalance: number
}

const props = defineProps<{
  sobId: string
}>()

const { t, n } = useI18n()
const toast = useToastStore()

const editMode = ref(false)
const sob = ref<Sob>()
const firstPeriod = ref<Period>()
const ledgers = ref<LedgerRow[]>([])
const ledgerMap = ref<{ [key: string]: TreeNode<LedgerRow> }>({})

watch(
  () => props.sobId,
  async () => {
    sob.value = (await SobService.getSobById(props.sobId)).data
    await refresh()
  },
  { immediate: true },
)

const onBalanceUpdate = (data: LedgerRow) => {
  // update superiors
  let parent = ledgerMap.value[data.accountId].parent
  while (parent) {
    parent.data.openingBalance = parent.children.reduce((acc, child) => acc + child.data.openingBalance, 0)
    parent = parent.parent
  }
}

const refresh = async () => {
  const { data } = await LedgerService.getFirstPeriodLedgers(props.sobId)
  firstPeriod.value = data?.period
  ledgers.value =
    data?.ledgers
      .sort((l1, l2) => (l1.account.accountNumber > l2.account.accountNumber ? 1 : -1))
      .map((l) => ({ ...l, openingBalance: l.openingCreditBalance || l.openingDebitBalance })) ?? []

  ledgerMap.value = convert(
    ledgers.value,
    (l) => l.accountId,
    (l) => l.account.superiorAccountId,
  )
}

const onSave = async () => {
  const ledgerItems = ledgers.value
    .filter((l) => l.account.isLeaf)
    .map((l) => ({
      accountNumber: l.account.accountNumber,
      openingBalance: l.openingBalance,
    }))

  const { exception } = await LedgerService.initializeLedgers(props.sobId, { ledgers: ledgerItems })
  if (exception) {
    return
  }

  editMode.value = false
  toast.action.add({ severity: 'success', summary: t('sob.ledgerInitialize.updated') })
}

const onCancel = async () => {
  editMode.value = false
  await refresh()
}
</script>

<template>
  <DataTable :value="ledgers" data-key="id">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span>
          {{
            t('sob.ledgerInitialize.firstPeriod', {
              periodText: t('period.periodText', {
                fiscalYear: firstPeriod?.fiscalYear,
                number: firstPeriod?.periodNumber,
              }),
            })
          }}
        </span>
        <div class="flex justify-end gap-2">
          <Button :disabled="editMode" :label="t('action.edit')" @click="editMode = true" />
          <Button v-if="editMode" :label="t('action.save')" @click="onSave" />
          <Button v-if="editMode" text :label="t('action.cancel')" @click="onCancel" />
        </div>
      </div>
    </template>

    <Column :header="t('account.accountNumber')" field="account.accountNumber" />
    <Column :header="t('account.accountTitle')" field="account.title" />
    <Column :header="t('account.balanceDirection')" field="account.balanceDirection">
      <template #body="{ data }">
        {{ t(`account.balanceDirectionEnum.${data.account.balanceDirection}`) }}
      </template>
    </Column>
    <Column :header="t('ledger.openingBalance')">
      <template #body="{ data }">
        <InputNumber
          v-if="editMode"
          v-model="data.openingBalance"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          :disabled="!data.account.isLeaf"
          @update:model-value="() => onBalanceUpdate(data)"
        />
        <span v-else>{{ n(data.openingBalance, 'decimal') }}</span>
      </template>
    </Column>
  </DataTable>
</template>
