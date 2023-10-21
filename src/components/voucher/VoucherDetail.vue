<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { VoucherService, type UpdateVoucherRequest } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useUserStore } from '../../store/user'
import VoucherForm from './VoucherForm.vue'
import type { VoucherFormInput } from './types'

const props = defineProps<{
  sobId: string
  voucherId: string
}>()

const { t } = useI18n()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const voucher = ref<VoucherFormInput>()
const formRef = ref<InstanceType<typeof VoucherForm>>()
const editMode = ref(false)

const refreshVoucher = async () => {
  const { data } = await VoucherService.getVoucherById(props.sobId, props.voucherId)
  voucher.value = data
}

onMounted(async () => {
  await refreshVoucher()
})

const onSave = async () => {
  // collect form
  if (!formRef.value?.validate()) {
    return
  }

  const toBeUpdated = formRef.value?.collect()
  if (!toBeUpdated) {
    // validation is handled in voucher form
    return
  }

  // convert to request
  const request: UpdateVoucherRequest = {
    headerText: toBeUpdated.headerText,
    attachmentQuantity: toBeUpdated.attachmentQuantity,
    transactionTime: toBeUpdated.transactionTime,
    updater: userStore.state.userId,
    lineItems: toBeUpdated.lineItems.map((item) => ({
      id: item.id,
      accountNumber: item.account?.accountNumber ?? '',
      auxiliaryAccounts: item.auxiliaryAccounts?.map((aux) => ({ categoryKey: aux.category.key, accountKey: aux.key })),
      text: item.text,
      credit: item.credit,
      debit: item.debit,
    })),
  }

  const { exception } = await VoucherService.updateVoucher(props.sobId, props.voucherId, request)

  if (exception) {
    return
  }

  await refreshVoucher()

  editMode.value = false
  notificationStore.action.push({ type: 'success', message: t('voucher.save.success') })
}

const onCancel = () => {
  editMode.value = false
  formRef.value?.reset()
}

const onAction = async (action: 'audit' | 'cancelAudit' | 'review' | 'cancelReview' | 'post') => {
  let resp

  switch (action) {
    case 'audit':
      resp = await VoucherService.auditVoucher(props.sobId, props.voucherId, userStore.state.userId)
      break
    case 'cancelAudit':
      resp = await VoucherService.cancelAuditVoucher(props.sobId, props.voucherId, userStore.state.userId)
      break
    case 'review':
      resp = await VoucherService.reviewVoucher(props.sobId, props.voucherId, userStore.state.userId)
      break
    case 'cancelReview':
      resp = await VoucherService.cancelReviewVoucher(props.sobId, props.voucherId, userStore.state.userId)
      break
    case 'post':
      resp = await VoucherService.postVoucher(props.sobId, props.voucherId, userStore.state.userId)
  }

  if (resp?.exception) {
    return
  }

  await refreshVoucher()

  notificationStore.action.push({ type: 'success', message: t('voucher.save.success') })
}
</script>

<template>
  <BasePage>
    <template #title>{{ voucher?.documentNumber }}</template>

    <template #extra>
      <BaseButton
        v-if="!editMode"
        :disabled="editMode || voucher?.isAudited || voucher?.isReviewed"
        @click="editMode = true"
      >
        {{ t('action.edit') }}
      </BaseButton>
      <BaseButton v-if="editMode" category="primary" @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="editMode" @click="onCancel">{{ t('action.cancel') }}</BaseButton>
      <BaseButton v-if="!voucher?.isAudited" :disabled="editMode" @click="onAction('audit')">
        {{ t('voucher.audit') }}
      </BaseButton>
      <BaseConfirmationButton v-if="voucher?.isAudited" :disabled="editMode" @click="onAction('cancelAudit')">
        {{ t('voucher.cancelAudit') }}
      </BaseConfirmationButton>
      <BaseButton v-if="!voucher?.isReviewed" :disabled="editMode" @click="onAction('review')">
        {{ t('voucher.review') }}
      </BaseButton>
      <BaseConfirmationButton v-if="voucher?.isReviewed" :disabled="editMode" @click="onAction('cancelReview')">
        {{ t('voucher.cancelReview') }}
      </BaseConfirmationButton>
      <BaseButton
        v-if="voucher?.isReviewed && voucher.isAudited && !voucher.isPosted"
        category="primary"
        @click="onAction('post')"
      >
        {{ t('voucher.post') }}
      </BaseButton>
    </template>

    <VoucherForm v-if="voucher" ref="formRef" :voucher="voucher" :disabled="!editMode" />
  </BasePage>
</template>
