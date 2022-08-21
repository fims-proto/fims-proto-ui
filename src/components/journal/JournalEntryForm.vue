<script setup lang="ts">
import Big from 'big.js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LineItem, Traits } from '../../domain'

const props = defineProps<{
  transactionTime: Date
  attachmentQuantity: number
  lineItems: LineItem[]
  creator: Traits
  disabled?: boolean
  isReviewed?: boolean
  isAudited?: boolean
  isPosted?: boolean
}>()

const { t, d } = useI18n()

const internalTransactionTime = ref()
const internalAttachmentQuantity = ref()
const internalLineItems = ref<LineItem[]>([])

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

const inititialize = () => {
  internalTransactionTime.value = props.transactionTime
  internalAttachmentQuantity.value = props.attachmentQuantity
  internalLineItems.value = JSON.parse(JSON.stringify(props.lineItems))
}

defineExpose({
  collect,
  reset: inititialize,
})

inititialize()
</script>

<template>
  <div class="w-full">
    <!-- header -->
    <div class="h-14 flex flex-row justify-between items-end">
      <div class="flex-1 flex justify-start">
        <p v-if="disabled">{{ t('journal.entry.transactionTime') }} {{ d(internalTransactionTime, 'date') }}</p>
        <BaseFormItem v-else :label="t('journal.entry.transactionTime')" hide-label>
          <BaseInput v-model="internalTransactionTime" html-type="date" :prefix="t('journal.entry.transactionTime')" />
        </BaseFormItem>
      </div>
      <div class="flex-1 flex flex-row gap-4 justify-center items-end">
        <h3>{{ t('journal.entry.type') }}</h3>

        <div
          v-if="disabled"
          class="flex gap-4 items-end px-1 py-px text-sm text-neutral-500 border border-neutral-300/50 rounded-md shadow-sm"
        >
          <span class="flex">
            <BadgeCheckSolidIcon v-if="isAudited" class="w-4 text-success-600" />
            {{ isAudited ? t('journal.entry.isAudited') : t('journal.entry.notAudited') }}
          </span>
          <span class="flex">
            <BadgeCheckSolidIcon v-if="isReviewed" class="w-4 text-success-600" />
            {{ isReviewed ? t('journal.entry.isReviewed') : t('journal.entry.notReviewed') }}
          </span>
          <span class="flex">
            <BadgeCheckSolidIcon v-if="isPosted" class="w-4 text-success-600" />
            {{ isPosted ? t('journal.entry.isPosted') : t('journal.entry.notPosted') }}
          </span>
        </div>
      </div>
      <div class="flex-1 flex justify-end">
        <p v-if="disabled">
          {{ t('journal.entry.attachmentQuantity') }} {{ internalAttachmentQuantity }}
          {{ t('journal.entry.attachmentQuantityUnit') }}
        </p>
        <BaseFormItem v-else :label="t('journal.entry.attachmentQuantity')" hide-label>
          <BaseInput
            v-model="internalAttachmentQuantity"
            class="w-36"
            html-type="number"
            :prefix="t('journal.entry.attachmentQuantity')"
            :suffix="t('journal.entry.attachmentQuantityUnit')"
            :min="0"
          />
        </BaseFormItem>
      </div>
    </div>

    <!-- table -->
    <div class="flex flex-col bg-white mt-4 divide-y divide-neutral-300 border border-neutral-300 rounded-md shadow-lg">
      <!-- table header -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('journal.entry.summary') }}</div>
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('journal.entry.account') }}</div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('journal.entry.debit') }}</div>
          <TabulatedNumber :disabled="true" :header="true" />
        </div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('journal.entry.credit') }}</div>
          <TabulatedNumber :disabled="true" :header="true" />
        </div>
      </div>

      <!-- table body -->
      <div
        v-for="(item, i) in internalLineItems"
        :key="`create-entry-li-${i}`"
        class="flex flex-row divide-x divide-neutral-300"
      >
        <div class="flex-1 p-[1px] flex">
          <button
            v-if="!disabled"
            class="w-8 flex items-center justify-center text-neutral-300 hover:text-primary-800 focus:z-10"
            @click.prevent="onClearLineItem(i)"
          >
            <MinusCircleOutlineIcon class="w-4" />
          </button>
          <TabulatedInput v-model="item.summary" :disabled="disabled" @focus="onSummaryFocus(i)" />
        </div>
        <div class="flex-1 p-[1px]">
          <AccountInput v-model="item.accountNumber" :disabled="disabled" />
        </div>
        <div class="w-72">
          <TabulatedNumber v-model="item.debit" :disabled="disabled" />
        </div>
        <div class="w-72">
          <TabulatedNumber v-model="item.credit" :disabled="disabled" />
        </div>
      </div>

      <!-- new line -->
      <div v-if="!disabled">
        <button
          class="w-full flex gap-2 items-center px-2 py-1 text-sm text-neutral-400 shadow-inner hover:text-primary-800 hover:bg-primary-200/50 focus:z-10"
          @click.prevent="onNewLineItem"
        >
          <PlusCircleOutlineIcon class="w-4" />
          <span>{{ t('journal.entry.newLineItem') }}</span>
        </button>
      </div>

      <!-- total -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold px-3 py-2">{{ t('journal.entry.total') }}</div>
        <div class="w-72">
          <TabulatedNumber :disabled="true" :model-value="totalDebit" />
        </div>
        <div class="w-72">
          <TabulatedNumber :disabled="true" :model-value="totalCredit" />
        </div>
      </div>
    </div>

    <!-- footer -->
    <div class="mt-4">
      <span>
        {{ t('journal.entry.creator') }}:
        {{ t('common.userName', { lastName: creator.name?.last, firstName: creator.name?.first }) }}
      </span>
    </div>
  </div>
</template>
