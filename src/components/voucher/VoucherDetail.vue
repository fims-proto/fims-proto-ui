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

const onAction = async (action: 'audit' | 'cancelAudit' | 'review' | 'cancelReview') => {
  const voucherId = voucher.value?.id as string
  let resp

  switch (action) {
    case 'audit':
      resp = await VoucherService.auditVoucher(props.sobId, voucherId, userStore.state.userId)
      break
    case 'cancelAudit':
      resp = await VoucherService.cancelAuditVoucher(props.sobId, voucherId, userStore.state.userId)
      break
    case 'review':
      resp = await VoucherService.reviewVoucher(props.sobId, voucherId, userStore.state.userId)
      break
    case 'cancelReview':
      resp = await VoucherService.cancelReviewVoucher(props.sobId, voucherId, userStore.state.userId)
      break
  }

  if (resp?.exception) {
    return
  }

  await refreshVoucher()

  notificationStore.action.push({
    message: t('voucher.updateSuccess'),
    type: 'success',
  })
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
      <BaseButton v-if="!voucher?.isAudited" :disabled="editMode" @click="onAction('audit')">
        {{ t('voucher.audit') }}
      </BaseButton>
      <BaseButton v-if="voucher?.isAudited" :disabled="editMode" confirm @click="onAction('cancelAudit')">
        {{ t('voucher.cancelAudit') }}
      </BaseButton>
      <BaseButton v-if="!voucher?.isReviewed" :disabled="editMode" @click="onAction('review')">
        {{ t('voucher.review') }}
      </BaseButton>
      <BaseButton v-if="voucher?.isReviewed" :disabled="editMode" confirm @click="onAction('cancelReview')">
        {{ t('voucher.cancelReview') }}
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
