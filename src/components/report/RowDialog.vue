<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2 } from 'lucide-vue-next'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AccountInput from '@/components/account/AccountInput.vue'
import { ConfirmationButton } from '@/components/common/confirmation'
import { EditableField } from '@/components/common/form'

import type { AccountSlim, CashFlowItem } from '@/services/general-ledger'
import type { Row, UpdateExpressionRequest, UpdateRowRequest } from '@/services/report'
import { EXPRESSION_KIND, LEDGER_MEASURE, REFERENCE_SUM_FACTOR, ROW_SUM_FACTOR } from '@/services/report'
import { useAccountStore } from '@/store/account'
import { useToastStore } from '@/store/toast'
import { normalizeExpressionForKind, transformRowToRequest } from './report-transforms'
import type { RowLookup } from './report-row-tree'

const props = defineProps<{
  row: Row
  columns: { id: string; label: string }[]
  reportClass: string
  reportIsTemplate: boolean
  cashFlowItems: CashFlowItem[]
  referenceableRows: RowLookup[]
  mode?: 'view' | 'edit' | 'create'
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  saved: [row: UpdateRowRequest]
  deleted: [row: Row]
}>()

const { t } = useI18n()
const toast = useToastStore()
const accountStore = useAccountStore()

type LedgerAccountDraft = {
  account: AccountSlim | undefined
  accountNumber: string
  sumFactor: (typeof REFERENCE_SUM_FACTOR)[keyof typeof REFERENCE_SUM_FACTOR]
  measure: (typeof LEDGER_MEASURE)[number]
}

type CashFlowItemDraft = {
  code: string
  itemId?: string
  sumFactor: (typeof REFERENCE_SUM_FACTOR)[keyof typeof REFERENCE_SUM_FACTOR]
}

type RowReferenceDraft = {
  rowCode: string
  sumFactor: (typeof REFERENCE_SUM_FACTOR)[keyof typeof REFERENCE_SUM_FACTOR]
}

const draft = ref<UpdateRowRequest>(transformRowToRequest(props.row))
const ledgerAccounts = ref<LedgerAccountDraft[]>([])
const cashFlowItemRefs = ref<CashFlowItemDraft[]>([])
const rowReferences = ref<RowReferenceDraft[]>([])

const showEditUI = computed(() => props.mode !== 'view')
const expressionKind = computed(() => draft.value.expression.kind)
const displaySumFactorDisabled = computed(() => draft.value.sumFactor === ROW_SUM_FACTOR.ignore)
const expressionKindModel = computed({
  get: () => draft.value.expression.kind,
  set: (value: unknown) => handleKindChange(value),
})

watch(
  open,
  (isOpen) => {
    if (isOpen) initializeDraft()
  },
  { immediate: true },
)

function initializeDraft() {
  draft.value = transformRowToRequest(props.row)
  if (draft.value.sumFactor === ROW_SUM_FACTOR.ignore) {
    draft.value.displaySumFactor = false
  }

  ledgerAccounts.value =
    draft.value.expression.ledgerAccounts?.map((ref) => {
      const account = accountStore.state.allAccounts.find(
        (candidate) => candidate.id === ref.accountId || candidate.accountNumber === ref.accountNumber,
      )
      return {
        account,
        accountNumber: ref.accountNumber,
        sumFactor: ref.sumFactor,
        measure: ref.measure,
      }
    }) ?? []

  cashFlowItemRefs.value =
    draft.value.expression.cashFlowItems?.map((ref) => ({
      code: ref.code,
      itemId: ref.itemId,
      sumFactor: ref.sumFactor,
    })) ?? []

  rowReferences.value =
    draft.value.expression.rowReferences?.map((ref) => ({
      rowCode: ref.rowCode,
      sumFactor: ref.sumFactor,
    })) ?? []
}

function handleCancel() {
  initializeDraft()
  open.value = false
}

function onDelete() {
  open.value = false
  emit('deleted', props.row)
}

function handleKindChange(value: unknown) {
  if (!isExpressionKind(value)) return
  draft.value.expression = normalizeExpressionForKind({ kind: value })
}

function handleRowSumFactorChange(value: unknown) {
  const normalized = Number(value)
  if (
    normalized === ROW_SUM_FACTOR.add ||
    normalized === ROW_SUM_FACTOR.ignore ||
    normalized === ROW_SUM_FACTOR.deduct
  ) {
    draft.value.sumFactor = normalized
    if (normalized === ROW_SUM_FACTOR.ignore) {
      draft.value.displaySumFactor = false
    }
  }
}

function handleDisplaySumFactorChange(value: unknown) {
  if (draft.value.sumFactor === ROW_SUM_FACTOR.ignore) return
  draft.value.displaySumFactor = value === 'true'
}

function addLedgerAccount() {
  ledgerAccounts.value.push({
    account: undefined,
    accountNumber: '',
    sumFactor: REFERENCE_SUM_FACTOR.add,
    measure: 'net',
  })
}

function addCashFlowItem() {
  cashFlowItemRefs.value.push({
    code: '',
    sumFactor: REFERENCE_SUM_FACTOR.add,
  })
}

function addRowReference() {
  rowReferences.value.push({
    rowCode: '',
    sumFactor: REFERENCE_SUM_FACTOR.add,
  })
}

function handleSave() {
  if (!draft.value.text.trim()) {
    toast.action.error(t('report.msg.textIsRequired'))
    return
  }

  const expression = buildExpression()
  if (!expression) return

  emit('saved', {
    ...draft.value,
    text: draft.value.text.trim(),
    expression,
  })
  open.value = false
}

function buildExpression(): UpdateExpressionRequest | undefined {
  switch (draft.value.expression.kind) {
    case 'ledger_accounts': {
      if (!ledgerAccounts.value.length) {
        toast.action.error(t('report.msg.expressionReferenceRequired'))
        return undefined
      }
      const hasEmptyAccount = ledgerAccounts.value.some((row) => !row.account && !row.accountNumber)
      if (hasEmptyAccount) {
        toast.action.error(t('report.msg.accountRequired'))
        return undefined
      }
      return {
        kind: 'ledger_accounts',
        ledgerAccounts: ledgerAccounts.value.map((row) => ({
          accountNumber: row.account?.accountNumber ?? row.accountNumber,
          accountId: row.account?.id,
          sumFactor: row.sumFactor,
          measure: row.measure,
        })),
      }
    }
    case 'cash_flow_items': {
      if (!cashFlowItemRefs.value.length) {
        toast.action.error(t('report.msg.expressionReferenceRequired'))
        return undefined
      }
      const hasEmptyItem = cashFlowItemRefs.value.some((row) => !row.code)
      if (hasEmptyItem) {
        toast.action.error(t('report.msg.cashFlowItemRequired'))
        return undefined
      }
      return {
        kind: 'cash_flow_items',
        cashFlowItems: cashFlowItemRefs.value.map((row) => {
          const item = props.cashFlowItems.find((candidate) => candidate.code === row.code)
          return {
            code: row.code,
            itemId: item?.id ?? row.itemId,
            sumFactor: row.sumFactor,
          }
        }),
      }
    }
    case 'rows_explicit': {
      if (!rowReferences.value.length) {
        toast.action.error(t('report.msg.expressionReferenceRequired'))
        return undefined
      }
      const hasEmptyRow = rowReferences.value.some((row) => !row.rowCode)
      if (hasEmptyRow) {
        toast.action.error(t('report.msg.rowReferenceRequired'))
        return undefined
      }
      return {
        kind: 'rows_explicit',
        rowReferences: rowReferences.value.map((row) => ({
          rowCode: row.rowCode,
          sumFactor: row.sumFactor,
        })),
      }
    }
    case 'children_sum':
    case 'none':
      return {
        kind: draft.value.expression.kind,
      }
  }
}

function cashFlowItemLabel(code: string) {
  const item = props.cashFlowItems.find((candidate) => candidate.code === code)
  return item ? item.name : code
}

function rowReferenceLabel(rowCode: string) {
  const row = props.referenceableRows.find((candidate) => candidate.rowCode === rowCode)
  if (!row) return rowCode
  if (row.lineNo !== undefined) {
    return t('report.row.referenceLabelWithLineNo', { lineNo: row.lineNo, text: row.label })
  }
  return row.label
}

function isExpressionKind(value: unknown): value is (typeof EXPRESSION_KIND)[number] {
  return typeof value === 'string' && EXPRESSION_KIND.includes(value as (typeof EXPRESSION_KIND)[number])
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-3xl" :aria-describedby="undefined">
      <DialogHeader>
        <DialogTitle>
          {{
            props.mode === 'create'
              ? $t('report.btn.addRow')
              : props.mode === 'edit'
                ? $t('report.btn.editRow')
                : $t('report.btn.viewRow')
          }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <EditableField
          :label="$t('report.row.text')"
          label-for="rowText"
          :is-editing="showEditUI"
          :value="draft.text"
          @update:value="(value) => (draft.text = String(value ?? ''))"
        >
          <template #edit="{ value, onUpdate }">
            <Input
              id="rowText"
              type="text"
              :model-value="value"
              :placeholder="$t('report.row.text')"
              @update:model-value="(value) => onUpdate(String(value ?? ''))"
            />
          </template>
        </EditableField>

        <EditableField
          :label="$t('report.row.sumFactor')"
          :is-editing="showEditUI"
          :value="draft.sumFactor"
          :formatter="(val) => (val !== undefined ? $t(`report.row.sumFactorEnum.${val}`) : '')"
        >
          <template #edit="{ value }">
            <ToggleGroup
              variant="outline"
              type="single"
              :model-value="value"
              class="justify-start"
              :aria-label="$t('report.row.sumFactor')"
              @update:model-value="
                (v) => {
                  handleRowSumFactorChange(v)
                }
              "
            >
              <ToggleGroupItem :value="ROW_SUM_FACTOR.add">{{ $t('report.row.sumFactorEnum.1') }}</ToggleGroupItem>
              <ToggleGroupItem :value="ROW_SUM_FACTOR.deduct">{{ $t('report.row.sumFactorEnum.-1') }}</ToggleGroupItem>
              <ToggleGroupItem :value="ROW_SUM_FACTOR.ignore">{{ $t('report.row.sumFactorEnum.0') }}</ToggleGroupItem>
            </ToggleGroup>
          </template>
        </EditableField>

        <EditableField
          :label="$t('report.row.displaySumFactor')"
          :is-editing="showEditUI"
          :value="draft.displaySumFactor"
          :formatter="(val) => (val ? $t('common.yes') : $t('common.no'))"
        >
          <template #edit>
            <ToggleGroup
              variant="outline"
              type="single"
              :model-value="draft.displaySumFactor ? 'true' : 'false'"
              class="justify-start"
              :aria-label="$t('report.row.displaySumFactor')"
              :disabled="displaySumFactorDisabled"
              @update:model-value="handleDisplaySumFactorChange"
            >
              <ToggleGroupItem value="true">{{ $t('common.yes') }}</ToggleGroupItem>
              <ToggleGroupItem value="false">{{ $t('common.no') }}</ToggleGroupItem>
            </ToggleGroup>
          </template>
        </EditableField>

        <EditableField
          :label="$t('report.row.showLineNo')"
          :is-editing="showEditUI"
          :value="draft.showLineNo"
          :formatter="(val) => (val ? $t('common.yes') : $t('common.no'))"
        >
          <template #edit>
            <ToggleGroup
              variant="outline"
              type="single"
              :model-value="draft.showLineNo ? 'true' : 'false'"
              class="justify-start"
              :aria-label="$t('report.row.showLineNo')"
              @update:model-value="(v) => (draft.showLineNo = v === 'true')"
            >
              <ToggleGroupItem value="true">{{ $t('common.yes') }}</ToggleGroupItem>
              <ToggleGroupItem value="false">{{ $t('common.no') }}</ToggleGroupItem>
            </ToggleGroup>
          </template>
        </EditableField>

        <EditableField
          :label="$t('report.expression.kind')"
          :is-editing="showEditUI"
          :value="expressionKind"
          :formatter="(val) => (val ? $t(`report.expression.kindEnum.${val}`) : '')"
        >
          <template #edit>
            <NativeSelect v-model="expressionKindModel">
              <option v-for="kind in EXPRESSION_KIND" :key="kind" :value="kind">
                {{ $t(`report.expression.kindEnum.${kind}`) }}
              </option>
            </NativeSelect>
          </template>
        </EditableField>

        <div v-if="expressionKind === 'ledger_accounts'" class="space-y-2">
          <div class="flex items-center justify-between">
            <FieldLabel>{{ $t('report.expression.ledgerAccounts') }}</FieldLabel>
            <Button v-if="showEditUI" type="button" variant="outline" size="sm" @click="addLedgerAccount">
              <Plus class="mr-1 h-4 w-4" />
              {{ $t('report.btn.addReference') }}
            </Button>
          </div>

          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('report.expression.account') }}</TableHead>
                  <TableHead class="w-28">{{ $t('report.expression.sumFactor') }}</TableHead>
                  <TableHead class="w-36">{{ $t('report.expression.measure') }}</TableHead>
                  <TableHead v-if="showEditUI" class="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(ledgerRef, index) in ledgerAccounts" :key="index">
                  <TableCell>
                    <AccountInput
                      v-if="showEditUI"
                      v-model="ledgerRef.account"
                      :placeholder="$t('report.expression.account')"
                    />
                    <span v-else>
                      {{ ledgerRef.account?.accountNumber ?? ledgerRef.accountNumber }} -
                      {{ ledgerRef.account?.title ?? '' }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="ledgerRef.sumFactor">
                      <option :value="REFERENCE_SUM_FACTOR.add">{{ $t('report.expression.sumFactorEnum.1') }}</option>
                      <option :value="REFERENCE_SUM_FACTOR.deduct">
                        {{ $t('report.expression.sumFactorEnum.-1') }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ $t(`report.expression.sumFactorEnum.${ledgerRef.sumFactor}`) }}</span>
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="ledgerRef.measure">
                      <option v-for="measure in LEDGER_MEASURE" :key="measure" :value="measure">
                        {{ $t(`report.expression.measureEnum.${measure}`) }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ $t(`report.expression.measureEnum.${ledgerRef.measure}`) }}</span>
                  </TableCell>
                  <TableCell v-if="showEditUI">
                    <Button type="button" variant="ghost" size="icon" @click="ledgerAccounts.splice(index, 1)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div v-if="expressionKind === 'cash_flow_items'" class="space-y-2">
          <div class="flex items-center justify-between">
            <FieldLabel>{{ $t('report.expression.cashFlowItems') }}</FieldLabel>
            <Button v-if="showEditUI" type="button" variant="outline" size="sm" @click="addCashFlowItem">
              <Plus class="mr-1 h-4 w-4" />
              {{ $t('report.btn.addReference') }}
            </Button>
          </div>

          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('report.expression.cashFlowItem') }}</TableHead>
                  <TableHead class="w-28">{{ $t('report.expression.sumFactor') }}</TableHead>
                  <TableHead v-if="showEditUI" class="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(cashFlowRef, index) in cashFlowItemRefs" :key="index">
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="cashFlowRef.code">
                      <option value="">{{ $t('report.expression.selectCashFlowItem') }}</option>
                      <option v-for="item in props.cashFlowItems" :key="item.id" :value="item.code">
                        {{ item.name }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ cashFlowItemLabel(cashFlowRef.code) }}</span>
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="cashFlowRef.sumFactor">
                      <option :value="REFERENCE_SUM_FACTOR.add">{{ $t('report.expression.sumFactorEnum.1') }}</option>
                      <option :value="REFERENCE_SUM_FACTOR.deduct">
                        {{ $t('report.expression.sumFactorEnum.-1') }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ $t(`report.expression.sumFactorEnum.${cashFlowRef.sumFactor}`) }}</span>
                  </TableCell>
                  <TableCell v-if="showEditUI">
                    <Button type="button" variant="ghost" size="icon" @click="cashFlowItemRefs.splice(index, 1)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div v-if="expressionKind === 'rows_explicit'" class="space-y-2">
          <div class="flex items-center justify-between">
            <FieldLabel>{{ $t('report.expression.rowReferences') }}</FieldLabel>
            <Button v-if="showEditUI" type="button" variant="outline" size="sm" @click="addRowReference">
              <Plus class="mr-1 h-4 w-4" />
              {{ $t('report.btn.addReference') }}
            </Button>
          </div>

          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('report.expression.rowReference') }}</TableHead>
                  <TableHead class="w-28">{{ $t('report.expression.sumFactor') }}</TableHead>
                  <TableHead v-if="showEditUI" class="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(rowRef, index) in rowReferences" :key="index">
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="rowRef.rowCode">
                      <option value="">{{ $t('report.expression.selectRowReference') }}</option>
                      <option
                        v-for="availableRow in referenceableRows"
                        :key="availableRow.rowCode"
                        :value="availableRow.rowCode"
                      >
                        {{ rowReferenceLabel(availableRow.rowCode) }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ rowReferenceLabel(rowRef.rowCode) }}</span>
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-if="showEditUI" v-model="rowRef.sumFactor">
                      <option :value="REFERENCE_SUM_FACTOR.add">{{ $t('report.expression.sumFactorEnum.1') }}</option>
                      <option :value="REFERENCE_SUM_FACTOR.deduct">
                        {{ $t('report.expression.sumFactorEnum.-1') }}
                      </option>
                    </NativeSelect>
                    <span v-else>{{ $t(`report.expression.sumFactorEnum.${rowRef.sumFactor}`) }}</span>
                  </TableCell>
                  <TableCell v-if="showEditUI">
                    <Button type="button" variant="ghost" size="icon" @click="rowReferences.splice(index, 1)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DialogFooter>
        <template v-if="!showEditUI">
          <Button variant="outline" @click="open = false">{{ $t('action.close') }}</Button>
        </template>
        <template v-else>
          <ConfirmationButton
            v-if="props.mode === 'edit' && row.canEdit"
            variant="destructive"
            :message="$t('report.msg.confirmDeleteRow')"
            class="mr-auto"
            @confirm="onDelete"
          >
            {{ $t('action.delete') }}
          </ConfirmationButton>
          <Button variant="outline" @click="handleCancel">{{ $t('action.cancel') }}</Button>
          <Button @click="handleSave">{{ $t('action.save') }}</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
