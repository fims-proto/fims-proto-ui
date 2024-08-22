<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FlexRender, createColumnHelper, useVueTable, getCoreRowModel, getExpandedRowModel } from '@tanstack/vue-table'
import { LedgerService, SobService, type Ledger, type Period, type Sob } from '../../domain'
import { useNotificationStore } from '../../store/notification'

interface LedgerNode extends Ledger {
  openingBalance: number
  children: LedgerNode[]
  parent?: LedgerNode
}

const props = defineProps<{
  sobId: string
}>()

const { t, n } = useI18n()
const notificationStore = useNotificationStore()

const editMode = ref(false)
const sob = ref<Sob>()
const firstPeriod = ref<Period>()
const ledgerMap = ref<{ [name: string]: LedgerNode }>({}) // key: account id
const ledgerTree = ref<LedgerNode[]>([])

const columnHelper = createColumnHelper<LedgerNode>()

const columns = [
  columnHelper.display({
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand()
        ? h(
            'button',
            {
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: 'pointer' },
            },
            row.getIsExpanded() ? '👇' : '👉',
          )
        : null
    },
  }),
  // account number
  columnHelper.accessor((l) => l.account.accountNumber, {
    id: 'accountNumber',
    header: t('account.accountNumber'),
  }),
  // title
  columnHelper.accessor((l) => l.account.title, {
    id: 'accountTitle',
    header: t('account.accountTitle'),
  }),
  // balance direction
  columnHelper.accessor((l) => l.account.balanceDirection, {
    id: 'balanceDirection',
    header: t('account.balanceDirection'),
    cell: (info) => t(`account.balanceDirectionEnum.${info.getValue()}`),
  }),
  // opening balance
  columnHelper.accessor((l) => l.openingBalance, {
    id: 'openingBalance',
    header: t('ledger.openingBalance'),
    cell: ({ getValue, row: { original } }) => {
      if (!editMode.value || !original.account.isLeaf) {
        return n(getValue(), 'decimal')
      }

      return h('input', {
        type: 'number',
        value: getValue(),
        onChange: (e: Event) => updateBalance(original.account.id, Number((e.target as HTMLInputElement)?.value)),
      })
    },
  }),
]

const table = useVueTable({
  columns,
  get data() {
    return ledgerTree.value
  },
  initialState: {
    expanded: true,
  },
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getSubRows: (l) => l.children,
  debugTable: true,
})

onMounted(async () => {
  ;({ data: sob.value } = await SobService.getSobById(props.sobId))
  await initialize()
})

const initialize = async () => {
  const { data } = await LedgerService.getFirstPeriodLedgers(props.sobId)
  const rawLedgers = data?.ledgers || []
  firstPeriod.value = data?.period
  ledgerMap.value = {}

  const startTime = performance.now()

  rawLedgers.sort((rl1, rl2) => rl1.account.level - rl2.account.level)

  for (const rl of rawLedgers) {
    // cache into map
    let lt = ledgerMap.value[rl.accountId]
    if (!lt) {
      // a ledger having both opening credit and debit balance is invalid
      rl.openingCreditBalance &&
        rl.openingDebitBalance &&
        console.error(`${rl.account.accountNumber} has both opening credit and debit balance`)

      lt = { ...rl, openingBalance: rl.openingCreditBalance || rl.openingDebitBalance, children: [] }
      ledgerMap.value[rl.accountId] = lt
    }

    if (!rl.account.superiorAccountId) {
      continue
    }

    // add to superior as child
    const slt = ledgerMap.value[rl.account.superiorAccountId]
    if (!slt) {
      // if rawLedgers are sorted well, shouldn't go into this branch
      console.error(`Superior account not found for ${rl.account.accountNumber}`)
      alert(`Superior account not found for ${rl.account.accountNumber}`)
      return
    }
    slt.children.push(lt)
    lt.parent = slt
  }

  renderLedgerTree()

  console.info(`Initializing ledger tree took ${performance.now() - startTime} ms`)
}

const updateBalance = (accountId: string, value: number) => {
  const startTime = performance.now()

  ledgerMap.value[accountId].openingBalance = value

  // update parent
  let parent = ledgerMap.value[accountId].parent
  while (parent) {
    parent.openingBalance = parent.children.reduce((acc, child) => acc + child.openingBalance, 0)
    parent = parent.parent
  }

  renderLedgerTree()

  console.info(`Updating ledger tree took ${performance.now() - startTime} ms`)
}

const renderLedgerTree = () =>
  (ledgerTree.value = Object.entries(ledgerMap.value)
    .filter(([, l]) => l.account.level === 1)
    .map(([, l]) => l))

const onSave = async () => {
  const ledgerItems = Object.entries(ledgerMap.value)
    .map(([, l]) => l)
    .filter((l) => l.account.isLeaf)
    .map((l) => ({
      accountNumber: l.account.accountNumber,
      openingBalance: l.openingBalance,
    }))

  const { exception } = await LedgerService.initializeLedgers(props.sobId, { ledgers: ledgerItems })
  if (!exception) {
    editMode.value = false
  }
  notificationStore.action.push({
    type: 'success',
    message: t('sob.ledgersInitialization.updated'),
  })
}

const onCancel = async () => {
  editMode.value = false
  await initialize()
}
</script>

<template>
  <BasePage :subtitle="t('sob.ledgersInitialization.title')">
    <template #title>{{ sob?.name }}</template>
    <template #extra>
      <BaseButton :disabled="editMode" @click="editMode = true">{{ t('action.edit') }}</BaseButton>
      <BaseButton v-if="editMode" category="primary" @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="editMode" @click="onCancel">{{ t('action.cancel') }}</BaseButton>
    </template>
    <div>
      <div>
        {{
          t('sob.ledgersInitialization.firstPeriod', {
            periodText: t('period.periodText', {
              fiscalYear: firstPeriod?.fiscalYear,
              number: firstPeriod?.periodNumber,
            }),
          })
        }}
      </div>
      <div>
        <table class="border border-neutral-600">
          <thead>
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                :colspan="header.colSpan"
                class="border border-neutral-600 p-1"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in table.getRowModel().rows" :key="row.id">
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="border border-neutral-600 p-1">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-for="footerGroup in table.getFooterGroups()" :key="footerGroup.id">
              <th
                v-for="header in footerGroup.headers"
                :key="header.id"
                :colSpan="header.colSpan"
                class="border border-neutral-600 p-1"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.footer"
                  :props="header.getContext()"
                />
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </BasePage>
</template>
