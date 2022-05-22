<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LineItem, Traits } from '../../domain'

export default defineComponent({
  props: {
    disabled: Boolean,
    transactionTime: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    attachmentQuantity: {
      type: Number,
      required: true,
    },
    lineItems: {
      type: Array as PropType<LineItem[]>,
      required: true,
    },
    creator: {
      type: Object as PropType<Traits>,
      required: true,
    },
  },
  setup(props) {
    const { t, d } = useI18n()

    const internalTransactionTime = ref(props.transactionTime)
    const internalPeriod = ref(props.period)
    const internalAttachmentQuantity = ref(props.attachmentQuantity)
    const internalLineItems = ref(props.lineItems)

    const totalDebit = computed(() => internalLineItems.value.reduce((sum, item) => sum + (item.debit ?? 0), 0))
    const totalCredit = computed(() => internalLineItems.value.reduce((sum, item) => sum + (item.credit ?? 0), 0))

    return {
      t,
      d,
      internalTransactionTime,
      internalPeriod,
      internalAttachmentQuantity,
      internalLineItems,
      totalDebit,
      totalCredit,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <!-- header -->
    <div class="h-14 flex flex-row justify-between items-end">
      <div class="flex-1 flex justify-start">
        <p v-if="disabled">{{ t('voucher.transactionTime') }} {{ d(internalTransactionTime, 'date') }}</p>
        <base-form-item v-else :label="t('voucher.transactionTime')" hide-label>
          <base-input v-model="internalTransactionTime" type="date" :prefix="t('voucher.transactionTime')" />
        </base-form-item>
      </div>
      <div class="flex-1 flex flex-row gap-4 justify-center items-baseline">
        <h1>{{ t('voucher.type') }}</h1>
        <span>{{ internalPeriod }}</span>
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
    <div class="flex flex-col mt-4 divide-y divide-neutral-400 border border-neutral-400 rounded-md shadow-md">
      <!-- table header -->
      <div class="flex flex-row divide-x divide-neutral-400">
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('voucher.summary') }}</div>
        <div class="flex-1 font-bold flex justify-center items-center">{{ t('voucher.account') }}</div>
        <div class="w-72 flex flex-col divide-y divide-neutral-400">
          <div class="text-center font-bold py-2">{{ t('voucher.debit') }}</div>
          <tabulated-number :disabled="true" :header="true" />
        </div>
        <div class="w-72 flex flex-col divide-y divide-neutral-400">
          <div class="text-center font-bold py-2">{{ t('voucher.credit') }}</div>
          <tabulated-number :disabled="true" :header="true" />
        </div>
      </div>
      <!-- table body -->
      <div
        v-for="(item, i) in internalLineItems"
        :key="`create-voucher-li-${i}`"
        class="flex flex-row divide-x divide-neutral-400"
      >
        <div class="flex-1 p-[1px]">
          <tabulated-input v-model="item.summary" :disabled="disabled" />
        </div>
        <div class="flex-1 p-[1px]">
          <tabulated-input v-model="item.accountNumber" :disabled="disabled" />
        </div>
        <div class="w-72">
          <tabulated-number v-model="item.debit" :disabled="disabled" />
        </div>
        <div class="w-72">
          <tabulated-number v-model="item.credit" :disabled="disabled" />
        </div>
      </div>
      <!-- total -->
      <div class="flex flex-row divide-x divide-neutral-400">
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
      {{ t('voucher.creator', { lastName: creator.name?.last, firstName: creator.name?.first }) }}
    </p>
  </div>
</template>
