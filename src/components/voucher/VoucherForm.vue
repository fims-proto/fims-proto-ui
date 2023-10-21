<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Big from 'big.js'
import { useI18n } from 'vue-i18n'
import { type FormRules } from '../reusable/form'
import BaseForm from '../reusable/form/BaseForm.vue'
import type { VoucherFormInput, VoucherFormLineItem, VoucherFormOutput } from './types'
import { useNotificationStore } from '../../store/notification'

const props = defineProps<{
  voucher: VoucherFormInput
  disabled?: boolean
}>()

const { t, d } = useI18n()
const notificationStore = useNotificationStore()

const headerFormRef = ref<InstanceType<typeof BaseForm>>()
const headerFormModel = ref({
  headerText: '',
  transactionTime: new Date(),
  attachmentQuantity: 0,
})
const headerFormRules: FormRules = {
  headerText: {
    validator: (value) => {
      if (!(value as string).trim()) {
        return Error('common.mandatoryFieldMissing')
      }
      return true
    },
  },
  transactionTime: {
    validator: (value) => {
      if (isNaN((value as Date).getTime())) {
        return Error('voucher.save.transactionTimeInvalid')
      }
      return true
    },
  },
}

const internalLineItems = ref<VoucherFormLineItem[]>([])

const totalDebit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.debit ?? 0)), Big(0)).toNumber(),
)
const totalCredit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.credit ?? 0)), Big(0)).toNumber(),
)

const periodNumber = computed(() =>
  t('period.periodText', {
    fiscalYear: headerFormModel.value.transactionTime.getFullYear(),
    number: headerFormModel.value.transactionTime.getMonth() + 1,
  }),
)

const emptyLineItem = () => ({ text: '', debit: 0, credit: 0 })

const onClearLineItem = (index: number) => internalLineItems.value.splice(index, 1)

const onNewLineItem = () => internalLineItems.value.push(emptyLineItem())

const validate = () => headerFormRef.value?.validate() ?? false

const collect = (): VoucherFormOutput | undefined => {
  const collectedLineItems = internalLineItems.value.filter(
    (item) => item.account && (item.credit?.toString() || item.debit?.toString()),
  )
  // populate voucher header text to line item text
  collectedLineItems.forEach((item) => (item.text = headerFormModel.value.headerText))

  // validate balance
  if (totalDebit.value !== totalCredit.value) {
    notificationStore.action.push({ type: 'error', message: t('voucher.save.notBalanced') })
    return
  }

  // validate line item existence
  if (!collectedLineItems.length) {
    notificationStore.action.push({ type: 'warning', message: t('voucher.save.emptyItems') })
    return
  }

  if (collectedLineItems.flatMap((item) => item.auxiliaryAccounts).find((a) => !a?.key)) {
    notificationStore.action.push({ type: 'error', message: t('voucher.save.emptyAuxiliaryAccountKey') })
    return
  }

  return Object.assign({}, props.voucher, {
    headerText: headerFormModel.value.headerText.trim(),
    transactionTime: headerFormModel.value.transactionTime,
    attachmentQuantity: headerFormModel.value.attachmentQuantity,
    lineItems: collectedLineItems,
    totalDebit: totalDebit.value,
    totalCredit: totalCredit.value,
  })
}

const initialize = async () => {
  headerFormModel.value.headerText = props.voucher.headerText
  headerFormModel.value.transactionTime = props.voucher.transactionTime
  headerFormModel.value.attachmentQuantity = props.voucher.attachmentQuantity
  internalLineItems.value = JSON.parse(JSON.stringify(props.voucher.lineItems)) // deep copy
}

onMounted(async () => initialize())

defineExpose<{
  validate: () => boolean
  collect: () => VoucherFormOutput | undefined
  reset: () => void
}>({
  validate,
  collect,
  reset: initialize,
})
</script>

<template>
  <div class="w-full">
    <!-- header -->
    <BaseForm
      ref="headerFormRef"
      :model="headerFormModel"
      :rules="headerFormRules"
      :disabled="disabled"
      class="flex gap-4 items-baseline"
    >
      <!-- header text -->
      <h1 v-if="disabled" class="font-black">{{ voucher.headerText }}</h1>
      <BaseFormItem v-else path="headerText" required :label="t('voucher.headerText')">
        <BaseInput
          v-model="headerFormModel.headerText"
          :placeholder="t('voucher.headerTextPlaceholder')"
          required
          class="w-80"
        />
      </BaseFormItem>

      <span v-if="disabled">{{ periodNumber }}</span>

      <!-- transaction time field -->
      <span v-if="disabled" class="ml-auto">{{ d(headerFormModel.transactionTime, 'short') }}</span>
      <div v-else class="flex gap-2">
        <BaseFormItem path="transactionTime" required :label="t('voucher.transactionTime')">
          <BaseInput v-model="headerFormModel.transactionTime" html-type="date" required :suffix="periodNumber" />
        </BaseFormItem>
      </div>

      <!-- attachment quntity field -->
      <span v-if="disabled">
        {{ t('voucher.attachmentQuantity') }} {{ headerFormModel.attachmentQuantity }}
        {{ t('voucher.attachmentQuantityUnit') }}
      </span>
      <BaseFormItem v-else path="attachmentQuantity" :label="t('voucher.attachmentQuantity')">
        <BaseInput
          v-model="headerFormModel.attachmentQuantity"
          class="w-36"
          html-type="number"
          :force-integer="true"
          :suffix="t('voucher.attachmentQuantityUnit')"
          :min="0"
        />
      </BaseFormItem>
    </BaseForm>

    <!-- table -->
    <div class="flex flex-col bg-white mt-4 divide-y divide-neutral-300 border border-neutral-300 rounded-md shadow-lg">
      <!-- table header -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('voucher.account') }}</div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('voucher.debit') }}</div>
          <TabulatedNumber :disabled="true" :header="true" />
        </div>
        <div class="w-72 flex flex-col divide-y divide-neutral-300">
          <div class="text-center font-bold py-2">{{ t('voucher.credit') }}</div>
          <TabulatedNumber :disabled="true" :header="true" />
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
            <MinusCircleMiniIcon class="w-4" />
          </button>

          <AccountInput
            v-model:account="item.account"
            v-model:auxiliary-accounts="item.auxiliaryAccounts"
            :disabled="disabled"
          />
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
          <PlusCircleMiniIcon class="w-4" />
          <span>{{ t('voucher.newLineItem') }}</span>
        </button>
      </div>

      <!-- total -->
      <div class="flex flex-row divide-x divide-neutral-300">
        <div class="flex-1 font-bold px-3 py-2">{{ t('voucher.total') }}</div>
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
        {{ t('voucher.creator') }}:
        {{
          t('common.userName', {
            lastName: voucher.creator?.traits.name?.last,
            firstName: voucher.creator?.traits.name?.first,
          })
        }}
      </span>
    </div>
  </div>
</template>
