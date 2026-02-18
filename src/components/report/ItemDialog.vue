<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import { z } from 'zod'
import { Trash2, Plus } from 'lucide-vue-next'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AccountInput from '@/components/account/AccountInput.vue'
import { EditableField } from '@/components/common/form'
import { VisuallyHidden } from 'reka-ui'

import type { Item } from '@/services/report'
import type { Account } from '@/services/general-ledger'
import { DATA_SOURCE, ITEM_SUM_FACTOR, FORMULA_SUM_FACTOR, FORMULA_RULE } from '@/services/report/constants'
import { useToastStore } from '@/store/toast'

const props = defineProps<{
  sobId: string
  reportId: string
  reportClass: string
  reportIsTemplate: boolean
  item: Item
  amountTypes: string[]
  mode?: 'view' | 'edit' | 'create' // NEW
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  saved: [item: Item]
}>()

const { t } = useI18n()
const toast = useToastStore()

// Formula row type for editing
type FormulaRow = {
  account: Account | undefined
  sumFactor: (typeof FORMULA_SUM_FACTOR)[keyof typeof FORMULA_SUM_FACTOR]
  rule: (typeof FORMULA_RULE)[number]
}

// Form schema
const ItemEditSchema = z.object({
  text: z.string().min(1, { message: t('report.msg.textIsRequired') }),
  sumFactor: z.number(),
  dataSource: z.string(),
})

const form = useForm({
  validationSchema: toTypedSchema(ItemEditSchema),
})

// Formula rows state
const formulaRows = ref<FormulaRow[]>([])

// Conditional rule options based on report class
const availableRules = computed(() => {
  if (props.reportClass === 'balance_sheet') {
    // Balance sheet: only 'net' (余额)
    return FORMULA_RULE.filter((rule) => rule === 'net')
  } else if (props.reportClass === 'income_statement') {
    // Income statement: all rules
    return FORMULA_RULE
  }
  return FORMULA_RULE
})

// Show edit mode UI for create mode
const showEditUI = computed(() => props.mode !== 'view')

// Watch for dialog open to initialize form
watch(
  open,
  (isOpen) => {
    if (isOpen) {
      initializeForm()
    }
  },
  { immediate: true },
)

function initializeForm() {
  // Set form values
  form.setValues({
    text: props.item.text,
    sumFactor: props.item.sumFactor,
    dataSource: props.item.dataSource,
  })

  // Initialize formula rows
  // Note: The item.formulas have a simplified Account type from the report service
  // We need to convert to the full Account type expected by AccountInput
  if (props.item.formulas && props.item.formulas.length > 0) {
    formulaRows.value = props.item.formulas.map((formula) => ({
      // Cast the report Account to the general-ledger Account type
      // The AccountInput will handle validation internally
      account: formula.account as unknown as Account,
      sumFactor: formula.sumFactor,
      rule: formula.rule,
    }))
  } else {
    formulaRows.value = []
  }
}

function createEmptyFormulaRow(): FormulaRow {
  return {
    account: undefined,
    sumFactor: FORMULA_SUM_FACTOR.add,
    rule: availableRules.value[0] ?? 'net',
  }
}

function addFormulaRow() {
  formulaRows.value.push(createEmptyFormulaRow())
}

function removeFormulaRow(index: number) {
  formulaRows.value.splice(index, 1)
}

function handleCancel() {
  // Always just close the dialog and reset form
  // Parent controls edit mode, so no mode switching needed here
  initializeForm()
  open.value = false
}

async function handleSave() {
  const result = await form.validate()
  if (!result.valid) {
    return
  }

  const values = form.values

  if (values.dataSource === 'formulas' && formulaRows.value.length > 0) {
    const hasEmptyAccount = formulaRows.value.some((row) => !row.account)
    if (hasEmptyAccount) {
      toast.action.error(t('report.msg.accountRequired'))
      return
    }
  }

  const updatedItem: Item = {
    ...props.item,
    text: values.text!,
    sumFactor: values.sumFactor as (typeof ITEM_SUM_FACTOR)[keyof typeof ITEM_SUM_FACTOR],
    dataSource: values.dataSource as (typeof DATA_SOURCE)[number],
    formulas:
      values.dataSource === 'formulas'
        ? formulaRows.value.map((row) => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            account: row.account!,
            sumFactor: row.sumFactor,
            rule: row.rule,
            amounts: [],
          }))
        : undefined,
  }

  emit('saved', updatedItem)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90vh] max-w-4xl overflow-y-auto sm:max-w-4xl">
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle>
            {{
              props.mode === 'create'
                ? $t('report.btn.addItem')
                : props.mode === 'edit'
                  ? $t('report.btn.editItem')
                  : $t('report.btn.viewItem')
            }}
          </DialogTitle>
          <DialogDescription>
            {{ item.text }}
          </DialogDescription>
        </DialogHeader>
      </VisuallyHidden>

      <div class="space-y-4">
        <!-- Text input -->
        <VeeField v-slot="{ field, errors }" name="text">
          <EditableField
            :label="$t('report.item.text')"
            label-for="itemText"
            :is-editing="showEditUI"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <Input
                id="itemText"
                type="text"
                :model-value="value"
                :name="field.name"
                :placeholder="$t('report.item.text')"
                :aria-invalid="!!errors.length"
                @update:model-value="onUpdate"
                @blur="field.onBlur"
              />
            </template>
          </EditableField>
        </VeeField>

        <!-- Sum factor radio -->
        <VeeField v-slot="{ field }" name="sumFactor">
          <EditableField
            :label="$t('report.item.sumFactor')"
            :is-editing="showEditUI"
            :value="field.value"
            :formatter="(val) => (val !== undefined ? $t(`report.item.sumFactorEnum.${val}`) : '')"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <ToggleGroup
                variant="outline"
                type="single"
                :model-value="value"
                class="justify-start"
                :aria-label="$t('report.item.sumFactor')"
                @update:model-value="(v) => onUpdate(v as number | undefined)"
              >
                <ToggleGroupItem :value="ITEM_SUM_FACTOR.add">{{ $t('report.item.sumFactorEnum.1') }}</ToggleGroupItem>
                <ToggleGroupItem :value="ITEM_SUM_FACTOR.deduct">{{
                  $t('report.item.sumFactorEnum.-1')
                }}</ToggleGroupItem>
                <ToggleGroupItem :value="ITEM_SUM_FACTOR.ignore">{{
                  $t('report.item.sumFactorEnum.0')
                }}</ToggleGroupItem>
              </ToggleGroup>
            </template>
          </EditableField>
        </VeeField>

        <!-- Data source radio -->
        <VeeField v-slot="{ field }" name="dataSource">
          <EditableField
            :label="$t('report.dataSource')"
            :is-editing="showEditUI"
            :value="field.value"
            :formatter="(val) => (val ? $t(`report.dataSourceEnum.${val}`) : '')"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <ToggleGroup
                variant="outline"
                type="single"
                :model-value="value"
                class="justify-start"
                :aria-label="$t('report.dataSource')"
                @update:model-value="(v) => onUpdate(v as string | undefined)"
              >
                <ToggleGroupItem v-for="source in DATA_SOURCE" :key="source" :value="source">
                  {{ $t(`report.dataSourceEnum.${source}`) }}
                </ToggleGroupItem>
              </ToggleGroup>
            </template>
          </EditableField>
        </VeeField>

        <!-- Formula table with amounts (view mode only) -->
        <div v-if="mode === 'view' && item.dataSource === 'formulas' && item.formulas && item.formulas.length > 0">
          <div class="mb-2 text-sm font-medium">{{ $t('report.dataSourceEnum.formulas') }}</div>
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('report.formula.accountTitle') }}</TableHead>
                  <TableHead class="w-20">{{ $t('report.formula.sumFactor') }}</TableHead>
                  <TableHead class="w-24">{{ $t('report.formula.rule') }}</TableHead>
                  <TableHead v-for="(amountType, idx) in amountTypes" :key="idx" class="w-32 text-right">
                    {{ $t(`report.amountTypeEnum.${amountType}`) }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(formula, index) in item.formulas" :key="index">
                  <TableCell> {{ formula.account.accountNumber }} - {{ formula.account.title }} </TableCell>
                  <TableCell>{{ $t(`report.formula.sumFactorEnum.${formula.sumFactor}`) }}</TableCell>
                  <TableCell>{{ $t(`report.formula.ruleEnum.${formula.rule}`) }}</TableCell>
                  <TableCell v-for="(amount, idx) in formula.amounts" :key="idx" class="text-right tabular-nums">
                    {{ amount ? $n(amount, 'decimal') : '' }}
                  </TableCell>
                </TableRow>
                <!-- Item amounts as total row -->
                <TableRow
                  v-if="!reportIsTemplate && item.amounts && item.amounts.length > 0"
                  class="border-t-2 font-medium"
                >
                  <TableCell colspan="3">{{ $t('common.total') }}</TableCell>
                  <TableCell v-for="(amount, idx) in item.amounts" :key="idx" class="text-right tabular-nums">
                    {{ amount ? $n(amount, 'decimal') : '' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Edit mode: Formulas table -->
        <div v-if="mode !== 'view' && form.values.dataSource === 'formulas'" class="space-y-2">
          <div class="flex items-center justify-between">
            <FieldLabel>{{ $t('report.dataSourceEnum.formulas') }}</FieldLabel>
            <Button type="button" variant="outline" size="sm" @click="addFormulaRow">
              <Plus class="mr-1 h-4 w-4" />
              {{ $t('report.btn.addFormula') }}
            </Button>
          </div>

          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('report.formula.accountTitle') }}</TableHead>
                  <TableHead class="w-28">{{ $t('report.formula.sumFactor') }}</TableHead>
                  <TableHead class="w-32">{{ $t('report.formula.rule') }}</TableHead>
                  <TableHead class="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, index) in formulaRows" :key="index">
                  <TableCell>
                    <AccountInput v-model="row.account" :placeholder="$t('report.formula.accountTitle')" />
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-model="row.sumFactor">
                      <option :value="FORMULA_SUM_FACTOR.add">{{ $t('report.formula.sumFactorEnum.1') }}</option>
                      <option :value="FORMULA_SUM_FACTOR.deduct">
                        {{ $t('report.formula.sumFactorEnum.-1') }}
                      </option>
                    </NativeSelect>
                  </TableCell>
                  <TableCell>
                    <NativeSelect v-model="row.rule">
                      <option v-for="rule in availableRules" :key="rule" :value="rule">
                        {{ $t(`report.formula.ruleEnum.${rule}`) }}
                      </option>
                    </NativeSelect>
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" @click="removeFormulaRow(index)">
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
          <!-- View mode: only Close button -->
          <Button variant="outline" @click="open = false">{{ $t('action.close') }}</Button>
        </template>
        <template v-else>
          <!-- Edit/Create mode: Save and Cancel buttons -->
          <Button variant="outline" @click="handleCancel">{{ $t('action.cancel') }}</Button>
          <Button @click="handleSave">{{ $t('action.save') }}</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
