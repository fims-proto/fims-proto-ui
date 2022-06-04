<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Voucher, User, VoucherService, UserService } from '../../domain'
import VoucherForm from './VoucherForm.vue'

const props = defineProps<{
  sobId: string
  voucherId: string
}>()

const { t } = useI18n()
const voucher = ref<Voucher>()
const creator = ref<User>()
const formRef = ref<InstanceType<typeof VoucherForm>>()
const editMode = ref(false)

onMounted(async () => {
  voucher.value = await VoucherService.getVoucherById(props.sobId, props.voucherId)
  creator.value = await UserService.whoIs(voucher.value.creator)
})

const onSave = async () => {
  // collect form
  const toBeUpdated = formRef.value?.collect()

  if (!toBeUpdated) {
    alert('empty data')
    return
  }

  if (toBeUpdated.totalDebit !== toBeUpdated.totalCredit) {
    alert('not balance')
    return
  }

  toBeUpdated.lineItems = toBeUpdated.lineItems.filter(
    (item) => item.summary.trim() && item.accountNumber.trim() && item.debit.toString() && item.credit.toString()
  )

  if (!toBeUpdated.lineItems.length) {
    alert('nothing input')
    return
  }

  voucher.value = await VoucherService.updateVoucher(
    props.sobId,
    props.voucherId,
    toBeUpdated.transactionTime,
    toBeUpdated.lineItems
  )

  editMode.value = false
}
</script>

<template>
  <base-page>
    <template #title>{{ voucher?.number }}</template>
    <template #extra>
      <base-button :disabled="editMode" @click="editMode = true">{{ t('action.edit') }}</base-button>
      <base-button v-if="editMode" category="primary" @click="onSave">{{ t('action.save') }}</base-button>
    </template>
    <voucher-form
      v-if="voucher && creator"
      ref="formRef"
      :disabled="!editMode"
      :attachment-quantity="voucher.attachmentQuantity"
      :transaction-time="voucher.transactionTime"
      :line-items="voucher.lineItems"
      period="period 暂定"
      :creator="creator.traits"
    />
  </base-page>
</template>
