<script setup lang="ts">
import Big from 'big.js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LineItem, Traits } from '../../domain'
import { FormRules } from '../reusable/form'
import BaseForm from '../reusable/form/BaseForm.vue'

const props = defineProps<{
  headerText: string
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

const headerFormRef = ref<InstanceType<typeof BaseForm>>()

const formModel = ref({
  headerText: '',
  transactionTime: new Date(),
  attachmentQuantity: 0,
})

const formRules: FormRules = {
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

const internalLineItems = ref<LineItem[]>([])

const totalDebit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.debit ?? 0)), Big(0)).toNumber()
)
const totalCredit = computed(() =>
  internalLineItems.value.reduce((sum, item) => sum.add(Big(item.credit ?? 0)), Big(0)).toNumber()
)

const emptyItem = () => ({
  text: '',
  accountNumber: '',
  credit: 0,
  debit: 0,
})

const onHeaderTextChange = () => internalLineItems.value.forEach((item) => (item.text = formModel.value.headerText))

const onClearLineItem = (index: number) => internalLineItems.value.splice(index, 1)

const onNewLineItem = () => internalLineItems.value.push(emptyItem())

const validate = () => {
  return headerFormRef.value?.validate()
}

const collect = () => ({
  headerText: formModel.value.headerText.trim(),
  transactionTime: formModel.value.transactionTime,
  attachmentQuantity: formModel.value.attachmentQuantity,
  lineItems: internalLineItems.value,
  totalDebit: totalDebit.value,
  totalCredit: totalCredit.value,
})

const initialize = () => {
  formModel.value.headerText = props.headerText
  formModel.value.transactionTime = props.transactionTime
  formModel.value.attachmentQuantity = props.attachmentQuantity
  internalLineItems.value = JSON.parse(JSON.stringify(props.lineItems))
}

defineExpose({
  validate,
  collect,
  reset: initialize,
})

initialize()
</script>

<template>
  <div class="w-full">
    <!-- header -->
    <BaseForm ref="headerFormRef" :model="formModel" :rules="formRules" class="flex gap-4">
      <!-- header text -->
      <BaseFormItem v-if="!disabled" path="headerText" required :label="t('voucher.headerText')">
        <BaseInput
          v-model="formModel.headerText"
          :placeholder="t('voucher.headerTextPlaceholder')"
          required
          class="w-80"
          @change="onHeaderTextChange"
        />
      </BaseFormItem>

      <!-- transaction time field -->
      <p v-if="disabled">{{ t('voucher.transactionTime') }}: {{ d(formModel.transactionTime, 'date') }}</p>
      <BaseFormItem v-else path="transactionTime" required :label="t('voucher.transactionTime')">
        <BaseInput v-model="formModel.transactionTime" html-type="date" required />
      </BaseFormItem>

      <!-- attachment quntity field -->
      <p v-if="disabled">
        {{ t('voucher.attachmentQuantity') }} {{ formModel.attachmentQuantity }}
        {{ t('voucher.attachmentQuantityUnit') }}
      </p>
      <BaseFormItem v-else path="attachmentQuantity" :label="t('voucher.attachmentQuantity')">
        <BaseInput
          v-model="formModel.attachmentQuantity"
          class="w-36"
          html-type="number"
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
        {{ t('common.userName', { lastName: creator.name?.last, firstName: creator.name?.first }) }}
      </span>
    </div>
  </div>
</template>
