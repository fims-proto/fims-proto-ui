<script lang="ts">
import { computed, defineComponent, PropType, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sob } from '../../domain'
import { useSobStore } from '../../store/sob'
import { useUserStore } from '../../store/user'

interface LineItem {
  summary: string | undefined
  accountNumber: string | undefined
  debit: number | undefined
  credit: number | undefined
}

export default defineComponent({
  props: {
    sob: {
      type: Object as PropType<Sob>,
      required: true,
    },
  },
  setup() {
    const { t, d } = useI18n()
    const { traits } = toRefs(useUserStore().state)
    const { currentPeriod } = toRefs(useSobStore().state)

    // voucherType: 'GENERAL_VOUCHER'

    const transactionTime = ref<Date>(new Date())
    const attachmentQuantity = ref<number>(0)
    const lineItems = ref<LineItem[]>(
      Array(4)
        .fill(null)
        .map(() => ({
          summary: undefined,
          accountNumber: undefined,
          debit: undefined,
          credit: undefined,
        }))
    )

    const totalDebit = computed(() => lineItems.value.reduce((sum, item) => sum + (item.debit ?? 0), 0))
    const totalCredit = computed(() => lineItems.value.reduce((sum, item) => sum + (item.credit ?? 0), 0))
    const period = computed(() =>
      currentPeriod.value
        ? `${currentPeriod.value.financialYear}-${currentPeriod.value.number}`
        : t('ledger.periodUnselected')
    )

    const onSave = () => {
      // TODO
    }
    const onSaveAndNew = () => {
      // TODO
    }

    return {
      t,
      d,
      period,
      transactionTime,
      attachmentQuantity,
      lineItems,
      totalDebit,
      totalCredit,
      traits,
      onSave,
      onSaveAndNew,
    }
  },
})
</script>

<template>
  <base-page>
    <template #title>{{ t('voucher.creation.title') }}</template>
    <template #extra>
      <base-button categoty="primary" @click="onSaveAndNew">{{ t('action.saveAndNew') }}</base-button>
      <base-button @click="onSave">{{ t('action.save') }}</base-button>
    </template>
    <div class="w-full">
      <div class="flex flex-row justify-between items-baseline">
        <div>{{ t('voucher.transactionTime', [d(transactionTime, 'date')]) }}</div>
        <div class="flex flex-row gap-4 items-baseline">
          <h1>{{ t('voucher.type') }}</h1>
          <span>{{ period }}</span>
        </div>
        <div>
          <base-input
            v-model="attachmentQuantity"
            class="w-36"
            :lite="true"
            type="number"
            :label="t('voucher.attachmentQuantity')"
            :hide-label="true"
            :prefix="t('voucher.attachmentQuantity')"
            :suffix="t('voucher.attachmentQuantityUnit')"
            :min="0"
          />
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
          v-for="(item, i) in lineItems"
          :key="`create-voucher-li-${i}`"
          class="flex flex-row divide-x divide-neutral-400"
        >
          <div class="flex-1 p-[1px]">
            <tabulated-input v-model="item.summary" />
          </div>
          <div class="flex-1 p-[1px]">
            <tabulated-input v-model="item.accountNumber" />
          </div>
          <div class="w-72">
            <tabulated-number v-model="item.debit" />
          </div>
          <div class="w-72">
            <tabulated-number v-model="item.credit" />
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
        {{ t('voucher.creator', { lastName: traits.name?.last, firstName: traits.name?.first }) }}
      </p>
    </div>
  </base-page>
</template>
