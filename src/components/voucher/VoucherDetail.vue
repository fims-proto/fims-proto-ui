<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Voucher, User, VoucherService, UserService } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useUserStore } from '../../store/user'
import VoucherForm from './VoucherForm.vue'

const props = defineProps<{
  sobId: string
  voucherId: string
}>()

const { t } = useI18n()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const voucher = ref<Voucher>()
const creator = ref<User>()
const formRef = ref<InstanceType<typeof VoucherForm>>()
const editMode = ref(false)

const refreshVoucher = async () => {
  const { data } = await VoucherService.getVoucherById(props.sobId, props.voucherId)
  voucher.value = data
}

onMounted(async () => {
  await refreshVoucher()
  const { data } = await UserService.whoIs(voucher.value?.creator as string)
  creator.value = data
})

const onSave = async () => {
  // collect form
  const toBeUpdated = formRef.value?.collect()

  if (!toBeUpdated) {
    alert('should not happen: empty data')
    return
  }

  if (toBeUpdated.totalDebit !== toBeUpdated.totalCredit) {
    notificationStore.action.push({
      type: 'error',
      message: t('voucher.save.notBalanced'),
      duration: 5,
    })
    return
  }

  toBeUpdated.lineItems = toBeUpdated.lineItems.filter(
    (item) => item.summary.trim() && item.accountNumber.trim() && item.debit.toString() && item.credit.toString()
  )

  if (!toBeUpdated.lineItems.length) {
    notificationStore.action.push({
      type: 'warning',
      message: t('voucher.save.emptyItems'),
      duration: 5,
    })
    return
  }

  const { exception } = await VoucherService.updateVoucher(
    props.sobId,
    props.voucherId,
    toBeUpdated.transactionTime,
    toBeUpdated.lineItems
  )

  if (exception) {
    return
  }

  await refreshVoucher()

  editMode.value = false
  notificationStore.action.push({
    type: 'success',
    message: t('voucher.save.success'),
    duration: 3,
  })
}

const onAudit = async () => {
  const { exception } = await VoucherService.auditVoucher(
    props.sobId,
    voucher.value?.id as string,
    userStore.state.userId
  )
  if (exception) {
    return
  }
  await refreshVoucher()
}

const onCancelAudit = async () => {
  const { exception } = await VoucherService.cancelAuditVoucher(
    props.sobId,
    voucher.value?.id as string,
    userStore.state.userId
  )
  if (exception) {
    return
  }
  await refreshVoucher()
}
</script>

<template>
  <BasePage :subtitle="voucher?.lineItems[0].summary">
    <template #title>{{ voucher?.number }}</template>
    <template #extra>
      <BaseButton :disabled="editMode || voucher?.isAudited || voucher?.isReviewed" @click="editMode = true">
        {{ t('action.edit') }}
      </BaseButton>
      <BaseButton v-if="editMode" type="primary" @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="!voucher?.isAudited" :disabled="editMode" @click="onAudit">
        {{ t('voucher.audit') }}
      </BaseButton>
      <BaseButton v-if="voucher?.isAudited" :disabled="editMode" confirm @click="onCancelAudit">
        {{ t('voucher.cancelAudit') }}
      </BaseButton>
    </template>
    <VoucherForm
      v-if="voucher && creator"
      ref="formRef"
      :disabled="!editMode"
      :attachment-quantity="voucher.attachmentQuantity"
      :transaction-time="voucher.transactionTime"
      :line-items="voucher.lineItems"
      :creator="creator.traits"
    />
  </BasePage>
</template>
