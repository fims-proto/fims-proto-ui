<script setup lang="ts">
import { toRefs, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NewVoucher, VoucherService } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useSobStore } from '../../store/sob'
import { useUserStore } from '../../store/user'
import VoucherForm from './VoucherForm.vue'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()
const { userId, traits } = toRefs(useUserStore().state)
const { workingSob } = toRefs(useSobStore().state)

const formRef = ref<InstanceType<typeof VoucherForm>>()

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

const saveVoucher = async () => {
  if (!workingSob.value) {
    alert('should not happen: invalid working sob')
    return
  }

  // collect form
  const toBeCreated = Object.assign({}, newVoucher.value, formRef.value?.collect())

  if (toBeCreated.totalDebit !== toBeCreated.totalCredit) {
    notificationStore.action.push({
      type: 'error',
      message: t('voucher.save.notBalanced'),
      duration: 5,
    })
    return
  }

  toBeCreated.creator = userId.value
  toBeCreated.lineItems = toBeCreated.lineItems.filter(
    (item) => item.summary.trim() && item.accountNumber.trim() && item.debit.toString() && item.credit.toString()
  )

  if (!toBeCreated.lineItems.length) {
    notificationStore.action.push({
      type: 'warning',
      message: t('voucher.save.emptyItems'),
      duration: 5,
    })
    return
  }

  const createdVoucher = await VoucherService.createVoucher(workingSob.value.id, toBeCreated)

  notificationStore.action.push({
    type: 'success',
    message: t('voucher.save.success'),
    duration: 3,
  })

  return createdVoucher
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
</script>

<template>
  <base-page>
    <template #title>{{ t('voucher.creation.title') }}</template>
    <template #extra>
      <base-button type="primary" @click="onSaveAndNew">{{ t('action.saveAndNew') }}</base-button>
      <base-button @click="onSave">{{ t('action.save') }}</base-button>
    </template>
    <voucher-form
      ref="formRef"
      :attachment-quantity="newVoucher.attachmentQuantity"
      :transaction-time="newVoucher.transactionTime"
      :line-items="newVoucher.lineItems"
      :creator="traits"
    />
  </base-page>
</template>
