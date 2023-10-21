<script setup lang="ts">
import { toRefs, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, type CreateVoucherRequest } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useSobStore } from '../../store/sob'
import { useUserStore } from '../../store/user'
import VoucherForm from './VoucherForm.vue'
import type { VoucherFormInput, VoucherFormOutput } from './types'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()
const { userId, traits } = toRefs(useUserStore().state)
const { workingSob } = toRefs(useSobStore().state)

const formRef = ref<InstanceType<typeof VoucherForm>>()

const emptyVoucher = () => ({
  headerText: '',
  transactionTime: new Date(),
  attachmentQuantity: 0,
  voucherType: 'general_voucher',
  creator: { id: userId.value, traits: traits.value },
  lineItems: Array(4).fill({ text: '', debit: 0, credit: 0 }),
})

const newVoucher = ref<VoucherFormInput>(emptyVoucher())

const saveVoucher = async () => {
  if (!workingSob.value) {
    alert('should not happen: invalid working sob')
    return
  }

  if (!formRef.value?.validate()) {
    return
  }

  // collect form
  const voucher: VoucherFormOutput = formRef.value?.collect()

  // validate balance
  if (voucher.totalDebit !== voucher.totalCredit) {
    notificationStore.action.push({ type: 'error', message: t('voucher.save.notBalanced') })
    return
  }

  // validate line item existence
  if (!voucher.lineItems.length) {
    notificationStore.action.push({ type: 'warning', message: t('voucher.save.emptyItems') })
    return
  }

  // convert to request
  const request: CreateVoucherRequest = {
    headerText: voucher.headerText,
    attachmentQuantity: voucher.attachmentQuantity,
    creator: voucher.creator?.id ?? '',
    voucherType: newVoucher.value.voucherType,
    transactionTime: voucher.transactionTime,
    lineItems: voucher.lineItems.map((item) => ({
      accountNumber: item.account?.accountNumber ?? '',
      auxiliaryAccounts: item.auxiliaryAccounts?.map((aux) => ({ categoryKey: aux.category.key, accountKey: aux.key })),
      text: item.text,
      credit: item.credit,
      debit: item.debit,
    })),
  }

  const { data, exception } = await VoucherService.createVoucher(workingSob.value.id, request)
  if (exception) {
    return
  }

  notificationStore.action.push({ type: 'success', message: t('voucher.save.success') })

  return data
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
    newVoucher.value = emptyVoucher()
    formRef.value?.reset()
  }
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('voucher.creation.title') }}</template>
    <template #extra>
      <BaseButton category="primary" @click="onSaveAndNew">{{ t('action.saveAndNew') }}</BaseButton>
      <BaseButton @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton @click="$router.go(-1)">{{ t('action.cancel') }}</BaseButton>
    </template>
    <VoucherForm ref="formRef" :voucher="newVoucher" />
  </BasePage>
</template>
