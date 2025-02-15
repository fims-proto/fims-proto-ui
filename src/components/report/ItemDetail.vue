<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { z, ZodError } from 'zod'
import {
  DATA_SOURCE,
  FORMULA_RULE,
  FORMULA_SUM_FACTOR,
  ITEM_SUM_FACTOR,
  ReportService,
  type Item,
} from '@domain/report'
import { AccountInput } from '../reusable/account-input'
import type { FormulaInput, ItemInput } from './types'
import { useToastStore } from '@store/toast'

const props = defineProps<{
  sobId: string
  reportId: string
  reportClass: string
  reportIsTemplate: boolean
  amountTypes: string[]
  item: Item
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'update'): void
}>()

const { t, n } = useI18n()
const toast = useToastStore()

const editable = ref(props.reportIsTemplate)
const itemValue = ref<ItemInput>()
const itemSchema = z.object({
  text: z.string().min(1, t('report.msg.textIsRequired')).trim(),
  sumFactor: z.nativeEnum(ITEM_SUM_FACTOR),
  dataSource: z.enum(DATA_SOURCE),
  formulas: z
    .array(
      z.object({
        sumFactor: z.nativeEnum(FORMULA_SUM_FACTOR),
        account: z.object({}),
        rule: z.enum(FORMULA_RULE),
      }),
    )
    .optional(),
})
const invalidFields = ref<{ [key: string]: boolean }>({})
const ruleOptions = computed<string[]>(() => [
  props.reportClass === 'income_statement' ? 'transaction' : 'net',
  'debit',
  'credit',
])
const emptyFormula = (): FormulaInput => ({
  sumFactor: 1,
  rule: props.reportClass === 'income_statement' ? 'transaction' : 'net',
})

onMounted(load)

function load() {
  itemValue.value = structuredClone(toRaw(props.item))
}

function onDataSourceChange() {
  if (!itemValue.value) {
    return
  }
  if (itemValue.value?.dataSource === 'formulas' && !itemValue.value.formulas) {
    itemValue.value.formulas = [emptyFormula()]
  } else {
    itemValue.value.formulas = undefined
  }
}

function onAddLineItem(index: number) {
  itemValue.value?.formulas?.splice(index, 0, emptyFormula())
}

function onRemoveLineItem(index: number) {
  itemValue.value?.formulas?.splice(index, 1)
}

async function onSubmit() {
  invalidFields.value = {}
  try {
    itemSchema.parse(itemValue.value)
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        invalidFields.value[err.path.join('.')] = true
      })
    }
    return
  }
  if (!itemValue.value) {
    return
  }

  const { exception } = await ReportService.updateItem(props.sobId, props.reportId, itemValue.value.id, {
    ...itemValue.value,
    formulas: itemValue.value.formulas?.map((f) => ({
      ...f,
      accountNumber: f.account!.accountNumber,
    })),
  })
  if (!exception) {
    toast.action.add({ severity: 'success', detail: t('report.msg.itemUpdated', itemValue.value.text) })
    emit('update')
  }
}
</script>

<template>
  <template v-if="itemValue">
    <!-- edit -->
    <div v-if="editable" class="flex flex-col gap-4">
      <div class="grid grid-cols-6 items-center gap-2">
        <label for="item-text-input" class="col-span-2">{{ t('report.item.text') }}</label>
        <div class="col-span-4">
          <InputText id="item-text-input" v-model="itemValue.text" :invalid="invalidFields['text']" class="w-full" />
        </div>

        <span class="col-span-2">{{ t('report.item.sumFactor') }}</span>
        <div class="col-span-4">
          <RadioButtonGroup v-model="itemValue.sumFactor" class="flex flex-wrap gap-4">
            <div class="flex items-center">
              <RadioButton input-id="item-sumFactor-1" :value="1" />
              <label for="item-sumFactor-1" class="ml-2">{{ t('report.item.sumFactorEnum.1') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton input-id="item-sumFactor-2" :value="-1" />
              <label for="item-sumFactor-2" class="ml-2">{{ t('report.item.sumFactorEnum.-1') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton input-id="item-sumFactor-3" :value="0" />
              <label for="item-sumFactor-3" class="ml-2">{{ t('report.item.sumFactorEnum.0') }}</label>
            </div>
          </RadioButtonGroup>
        </div>

        <span class="col-span-2">{{ t('report.dataSource') }}</span>
        <div class="col-span-4">
          <RadioButtonGroup
            v-model="itemValue.dataSource"
            class="flex flex-wrap gap-4"
            @value-change="onDataSourceChange"
          >
            <div class="flex items-center">
              <RadioButton input-id="item-dataSource-1" value="formulas" />
              <label for="item-dataSource-1" class="ml-2">{{ t('report.dataSourceEnum.formulas') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton input-id="item-dataSource-2" value="sum" />
              <label for="item-dataSource-2" class="ml-2">{{ t('report.dataSourceEnum.sum') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton input-id="item-dataSource-3" value="none" />
              <label for="item-dataSource-3" class="ml-2">{{ t('report.dataSourceEnum.none') }}</label>
            </div>
          </RadioButtonGroup>
        </div>
      </div>

      <DataTable v-if="itemValue.dataSource === 'formulas' && itemValue.formulas" :value="itemValue.formulas">
        <Column :exportable="false" style="width: 8rem">
          <template #body="{ index }">
            <Button
              icon="pi pi-plus"
              text
              rounded
              :aria-label="t('action.add')"
              :disabled="itemValue.formulas.length > 48"
              @click="onAddLineItem(index + 1)"
            />
            <Button
              icon="pi pi-minus"
              text
              rounded
              :aria-label="t('action.remove')"
              :disabled="itemValue.formulas.length === 1"
              @click="onRemoveLineItem(index)"
            />
          </template>
        </Column>
        <Column :header="t('report.formula.sumFactor')">
          <template #body="{ data, index }: { data: FormulaInput; index: number }">
            <RadioButtonGroup v-model="data.sumFactor" class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <RadioButton :input-id="`formula-sumFactor-${index}-1`" :value="1" />
                <label :for="`formula-sumFactor-${index}-1`" class="ml-2">
                  {{ t('report.formula.sumFactorEnum.1') }}
                </label>
              </div>
              <div class="flex items-center">
                <RadioButton :input-id="`formula-sumFactor-${index}-2`" :value="-1" />
                <label :for="`formula-sumFactor-${index}-2`" class="ml-2">
                  {{ t('report.formula.sumFactorEnum.-1') }}
                </label>
              </div>
            </RadioButtonGroup>
          </template>
        </Column>
        <Column :header="t('report.formula.accountTitle')">
          <template #body="{ data, index }: { data: FormulaInput; index: number }">
            <AccountInput
              :sob-id="sobId"
              :account-id="data.account?.id"
              :invalid="invalidFields[`formulas.${index}.account`]"
              @change="(a) => (data.account = a)"
            />
          </template>
        </Column>
        <Column field="rule" :header="t('report.formula.rule')">
          <template #body="{ data }: { data: FormulaInput }">
            <Select
              v-model="data.rule"
              :options="ruleOptions"
              :option-label="(v: string) => t(`report.formula.ruleEnum.${v}`)"
            />
          </template>
        </Column>
      </DataTable>

      <div class="flex gap-2">
        <Button :label="t('action.save')" @click="onSubmit" />
        <Button :label="t('action.cancel')" severity="secondary" @click="emit('close')" />
      </div>
    </div>

    <!-- view -->
    <div v-else class="flex flex-col gap-2">
      <DataTable v-if="itemValue.dataSource === 'formulas' && itemValue.formulas" :value="itemValue.formulas">
        <Column :header="t('report.formula.sumFactor')">
          <template #body="{ data }: { data: FormulaInput }">
            {{ t(`report.formula.sumFactorEnum.${data.sumFactor}`) }}
          </template>
        </Column>
        <Column :header="t('report.formula.accountTitle')">
          <template #body="{ data }: { data: FormulaInput }">
            {{ data.account?.accountNumber }} {{ data.account?.title }}
          </template>
        </Column>
        <Column
          v-for="(amountTypeTitle, atIndex) in amountTypes"
          :key="amountTypeTitle"
          :header="amountTypeTitle"
          class="text-right"
        >
          <template #body="{ data }: { data: FormulaInput }">
            {{ data.amounts?.[atIndex] ? n(data.amounts[atIndex], 'decimal') : '' }}
          </template>
        </Column>
      </DataTable>

      <div class="flex gap-2">
        <Button :label="t('action.edit')" @click="editable = true" />
        <Button :label="t('report.btn.editTemplate')" />
        <Button :label="t('action.close')" severity="secondary" @click="emit('close')" />
      </div>
    </div>
  </template>
</template>
