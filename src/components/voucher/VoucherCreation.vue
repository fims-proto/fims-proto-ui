<script lang="ts">
import { computed, defineComponent, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NewVoucher, VoucherService } from '../../domain'
import { useSobStore } from '../../store/sob'
import { useUserStore } from '../../store/user'

export default defineComponent({
  props: {
    sobId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t, d } = useI18n()
    const router = useRouter()
    const { userId, traits } = toRefs(useUserStore().state)
    const { workingSob, currentPeriod } = toRefs(useSobStore().state)

    const initVoucher = () => ({
      transactionTime: new Date(),
      attachmentQuantity: 0,
      voucherType: 'GENERAL_VOUCHER',
      creator: '',
      lineItems: Array(4)
        .fill(null)
        .map(() => ({
          summary: '',
          accountNumber: '',
          debit: 0,
          credit: 0,
        })),
    })

    const newVoucher = ref<NewVoucher>(initVoucher())

    const totalDebit = computed(() => newVoucher.value.lineItems.reduce((sum, item) => sum + (item.debit ?? 0), 0))
    const totalCredit = computed(() => newVoucher.value.lineItems.reduce((sum, item) => sum + (item.credit ?? 0), 0))
    const period = computed(() =>
      currentPeriod.value
        ? `${currentPeriod.value.financialYear}-${currentPeriod.value.number}`
        : t('ledger.periodUnselected')
    )

    const saveVoucher = async () => {
      if (!workingSob.value) {
        alert('invalid working sob')
        return
      }

      if (totalDebit.value !== totalCredit.value) {
        alert('not balance')
        return
      }

      // deep copy
      const toBeCreated = Object.assign({}, newVoucher.value)

      toBeCreated.creator = userId.value
      toBeCreated.lineItems = newVoucher.value.lineItems.filter(
        (item) => item.summary.trim() && item.accountNumber.trim() && item.debit.toString() && item.credit.toString()
      )

      if (!toBeCreated.lineItems.length) {
        alert('nothing input')
        return
      }

      return await VoucherService.createVoucher(workingSob.value.id, toBeCreated)
    }

    const onSave = async () => {
      const createdVoucher = await saveVoucher()
      if (createdVoucher) {
        router.push({
          name: 'voucherDetail',
          params: {
            sobId: props.sobId,
            voucherId: createdVoucher?.id,
          },
        })
      }
    }

    const onSaveAndNew = async () => {
      const createdVoucher = await saveVoucher()
      if (createdVoucher) {
        newVoucher.value = initVoucher()
      }
    }

    return {
      t,
      d,
      newVoucher,
      period,
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
      <base-button category="primary" @click="onSaveAndNew">{{ t('action.saveAndNew') }}</base-button>
      <base-button @click="onSave">{{ t('action.save') }}</base-button>
    </template>
    <voucher-form
      :attachment-quantity="newVoucher.attachmentQuantity"
      :transaction-time="newVoucher.transactionTime"
      :line-items="newVoucher.lineItems"
      :period="period"
      :creator="traits"
    />
  </base-page>
</template>
