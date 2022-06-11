<script setup lang="ts">
import Big from 'big.js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LineItem, Traits } from '../../domain'

const props = defineProps<{
  transactionTime: Date
  attachmentQuantity: number
  lineItems: LineItem[]
  creator: Traits
  disabled?: boolean
}>()

const { t, d } = useI18n()

const internalTransactionTime = computed(() => props.transactionTime)
const internalAttachmentQuantity = computed(() => props.attachmentQuantity)
const internalLineItems = computed(() => props.lineItems)
const totalDebit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.debit ?? 0)), Big(0)).toNumber()
)
const totalCredit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.credit ?? 0)), Big(0)).toNumber()
)

const onSummaryFocus = (index: number) => {
  if (index > 0 && !internalLineItems.value[index].summary) {
    internalLineItems.value[index].summary = internalLineItems.value[index - 1].summary
  }
}

const emptyItem = () => ({
  summary: '',
  accountNumber: '',
  credit: 0,
  debit: 0,
})

const onClearLineItem = (index: number) => (internalLineItems.value[index] = emptyItem())

const onNewLineItem = () => internalLineItems.value.push(emptyItem())

const collect = () => ({
  transactionTime: internalTransactionTime.value,
  attachmentQuantity: internalAttachmentQuantity.value,
  lineItems: internalLineItems.value,
  totalDebit: totalDebit.value,
  totalCredit: totalCredit.value,
})

defineExpose({
  collect,
})
</script>

<template>
  <div class="w-full">
    <!-- header -->
    <div class="h-14 flex flex-row justify-between items-end">
      <div class="flex-1 flex justify-start">
        <p v-if="disabled">{{ t('voucher.transactionTime') }} {{ d(internalTransactionTime, 'date') }}</p>
        <base-form-item v-else :label="t('voucher.transactionTime')" hide-label>
          <base-input v-model="internalTransactionTime" html-type="date" :prefix="t('voucher.transactionTime')" />
        </base-form-item>
      </div>
      <div class="flex-1 flex flex-row gap-4 justify-center items-baseline">
        <h1>{{ t('voucher.type') }}</h1>
      </div>
      <div class="flex-1 flex justify-end">
        <p v-if="disabled">
          {{ t('voucher.attachmentQuantity') }} {{ internalAttachmentQuantity }}
          {{ t('voucher.attachmentQuantityUnit') }}
        </p>
        <base-form-item v-else :label="t('voucher.attachmentQuantity')" hide-label>
          <base-input
            v-model="internalAttachmentQuantity"
            class="w-36"
            type="number"
            :prefix="t('voucher.attachmentQuantity')"
            :suffix="t('voucher.attachmentQuantityUnit')"
            :min="0"
          />
        </base-form-item>
      </div>
    </div>

    <!-- table -->
    <div class="flex flex-col bg-white mt-4 divide-y divide-neutral-300 border border-neutral-300 rounded-md shadow-lg">
      <!-- table header -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('voucher.summary') }}</div>
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('voucher.account') }}</div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('voucher.debit') }}</div>
          <tabulated-number :disabled="true" :header="true" />
        </div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('voucher.credit') }}</div>
          <tabulated-number :disabled="true" :header="true" />
        </div>
      </div>

      <!-- table body -->
      <div
        v-for="(item, i) in internalLineItems"
        :key="`create-voucher-li-${i}`"
        class="flex flex-row divide-x divide-neutral-300"
      >
        <div class="flex-1 p-[1px] flex">
          <button
            v-if="!disabled"
            class="w-8 flex items-center justify-center text-neutral-300 hover:text-primary-800 focus:z-10"
            @click.prevent="onClearLineItem(i)"
          >
            <minus-circle-outline-icon class="w-4" />
          </button>
          <tabulated-input v-model="item.summary" :disabled="disabled" @focus="onSummaryFocus(i)" />
        </div>
        <div class="flex-1 p-[1px]">
          <account-input v-model="item.accountNumber" :disabled="disabled" />
        </div>
        <div class="w-72">
          <tabulated-number v-model="item.debit" :disabled="disabled" />
        </div>
        <div class="w-72">
          <tabulated-number v-model="item.credit" :disabled="disabled" />
        </div>
      </div>

      <!-- new line -->
      <div v-if="!disabled">
        <button
          class="w-full flex gap-2 items-center px-2 py-1 text-sm text-neutral-400 shadow-inner hover:text-primary-800 hover:bg-primary-200/50 focus:z-10"
          @click.prevent="onNewLineItem"
        >
          <plus-circle-outline-icon class="w-4" />
          <span>{{ t('voucher.newLineItem') }}</span>
        </button>
      </div>

      <!-- total -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold px-3 py-2">{{ t('voucher.total') }}</div>
        <div class="w-72">
          <tabulated-number :disabled="true" :model-value="totalDebit" />
        </div>
        <div class="w-72">
          <tabulated-number :disabled="true" :model-value="totalCredit" />
        </div>
      </div>
    </div>

    <p class="mt-4">
      {{ t('voucher.creator') }}:
      {{ t('common.userName', { lastName: creator.name?.last, firstName: creator.name?.first }) }}
    </p>
  </div>
</template>
