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

const refreshVoucher = async () => (voucher.value = await VoucherService.getVoucherById(props.sobId, props.voucherId))

onMounted(async () => {
  await refreshVoucher()
  creator.value = await UserService.whoIs(voucher.value?.creator as string)
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

  voucher.value = await VoucherService.updateVoucher(
    props.sobId,
    props.voucherId,
    toBeUpdated.transactionTime,
    toBeUpdated.lineItems
  )

  editMode.value = false
  notificationStore.action.push({
    type: 'success',
    message: t('voucher.save.success'),
    duration: 3,
  })
}

const onAudit = async () => {
  await VoucherService.auditVoucher(props.sobId, voucher.value?.id as string, userStore.state.userId)
  await refreshVoucher()
}

const onCancelAudit = async () => {
  await VoucherService.cancelAuditVoucher(props.sobId, voucher.value?.id as string, userStore.state.userId)
  await refreshVoucher()
}
</script>

<template>
  <base-page :subtitle="voucher?.lineItems[0].summary">
    <template #title>{{ voucher?.number }}</template>
    <template #extra>
      <base-button :disabled="editMode || voucher?.isAudited || voucher?.isReviewed" @click="editMode = true">
        {{ t('action.edit') }}
      </base-button>
      <base-button v-if="editMode" type="primary" @click="onSave">{{ t('action.save') }}</base-button>
      <base-button v-if="!voucher?.isAudited" :disabled="editMode" @click="onAudit">
        {{ t('voucher.audit') }}
      </base-button>
      <base-button v-if="voucher?.isAudited" :disabled="editMode" @click="onCancelAudit">
        {{ t('voucher.cancelAudit') }}
      </base-button>
    </template>
    <voucher-form
      v-if="voucher && creator"
      ref="formRef"
      :disabled="!editMode"
      :attachment-quantity="voucher.attachmentQuantity"
      :transaction-time="voucher.transactionTime"
      :line-items="voucher.lineItems"
      :creator="creator.traits"
    />
  </base-page>
</template>
