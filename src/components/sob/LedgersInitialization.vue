<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LedgerService, SobService, type Ledger, type Period, type Sob } from '../../domain'

interface LedgerTree extends Ledger {
  children: LedgerTree[]
}

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const sob = ref<Sob>()
const firstPeriod = ref<Period>()
const rawLedgers = ref<Ledger[]>([])
const ledgers = ref<LedgerTree[]>([])

onMounted(async () => {
  ;({ data: sob.value } = await SobService.getSobById(props.sobId))
  const { data } = await LedgerService.getFirstPeriodLedgers(props.sobId)
  firstPeriod.value = data?.period
  rawLedgers.value = data?.ledgers || []

  convertLedgerTree()
})

function convertLedgerTree() {
  const startTime = performance.now()
  rawLedgers.value.sort((rl1, rl2) => rl1.account.level - rl2.account.level)

  const ledgersMap: { [name: string]: LedgerTree } = {} // key: account id

  for (const rl of rawLedgers.value) {
    // cache into map
    let lt = ledgersMap[rl.accountId]
    if (!lt) {
      lt = { ...rl, children: [] }
      ledgersMap[rl.accountId] = lt
    }

    // add to result if it's root level
    if (rl.account.level === 1) {
      ledgers.value.push(lt)
    }

    if (!rl.account.superiorAccountId) {
      continue
    }

    // add to superior as child
    const slt = ledgersMap[rl.account.superiorAccountId]
    if (!slt) {
      // if rawLedgers are sorted well, shouldn't go into this branch
      console.error(`Superior account not found for ${rl.account.accountNumber}`)
      alert(`Superior account not found for ${rl.account.accountNumber}`)
      return
    }
    slt.children.push(lt)
  }
  console.log(`Ledger tree conversion took ${performance.now() - startTime} ms`)
}
</script>

<template>
  <BasePage :subtitle="t('sob.ledgersInitialization.title')">
    <template #title>{{ sob?.name }}</template>
    <div>
      <p>
        {{
          t('sob.ledgersInitialization.firstPeriod', {
            periodText: t('period.periodText', {
              fiscalYear: firstPeriod?.fiscalYear,
              number: firstPeriod?.periodNumber,
            }),
          })
        }}
      </p>
      <p>{{ ledgers }}</p>
    </div>
  </BasePage>
</template>
