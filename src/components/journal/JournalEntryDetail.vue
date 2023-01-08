<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { JournalEntry, JournalService } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useUserStore } from '../../store/user'
import JournalEntryForm from './JournalEntryForm.vue'

const props = defineProps<{
  sobId: string
  entryId: string
}>()

const { t } = useI18n()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const entry = ref<JournalEntry>()
const formRef = ref<InstanceType<typeof JournalEntryForm>>()
const editMode = ref(false)

const refreshEntry = async () => {
  const { data } = await JournalService.getJournalEntryById(props.sobId, props.entryId)
  entry.value = data
}

onMounted(async () => {
  await refreshEntry()
})

const onSave = async () => {
  // collect form
  if (!formRef.value?.validate()) {
    return
  }

  const toBeUpdated = formRef.value?.collect()

  if (toBeUpdated.totalDebit !== toBeUpdated.totalCredit) {
    notificationStore.action.push({
      type: 'error',
      message: t('journal.entry.save.notBalanced'),
      duration: 5,
    })
    return
  }

  toBeUpdated.lineItems = toBeUpdated.lineItems.filter(
    (item) => item.accountNumber.trim() && item.debit.toString() && item.credit.toString()
  )

  if (!toBeUpdated.lineItems.length) {
    notificationStore.action.push({
      type: 'warning',
      message: t('journal.entry.save.emptyItems'),
      duration: 5,
    })
    return
  }

  const { exception } = await JournalService.updateJournalEntry(
    props.sobId,
    props.entryId,
    toBeUpdated.headerText,
    toBeUpdated.transactionTime,
    toBeUpdated.lineItems,
    userStore.state.userId
  )

  if (exception) {
    return
  }

  await refreshEntry()

  editMode.value = false
  notificationStore.action.push({
    type: 'success',
    message: t('journal.entry.save.success'),
    duration: 3,
  })
}

const onCancel = () => {
  editMode.value = false
  formRef.value?.reset()
}

const onAction = async (action: 'audit' | 'cancelAudit' | 'review' | 'cancelReview' | 'post') => {
  const entryId = entry.value?.entryId as string
  let resp

  switch (action) {
    case 'audit':
      resp = await JournalService.auditJournalEntry(props.sobId, entryId, userStore.state.userId)
      break
    case 'cancelAudit':
      resp = await JournalService.cancelAuditJournalEntry(props.sobId, entryId, userStore.state.userId)
      break
    case 'review':
      resp = await JournalService.reviewJournalEntry(props.sobId, entryId, userStore.state.userId)
      break
    case 'cancelReview':
      resp = await JournalService.cancelReviewJournalEntry(props.sobId, entryId, userStore.state.userId)
      break
    case 'post':
      resp = await JournalService.postJournalEntry(props.sobId, entryId, userStore.state.userId)
  }

  if (resp?.exception) {
    return
  }

  await refreshEntry()

  notificationStore.action.push({
    type: 'success',
    message: t('journal.entry.save.success'),
    duration: 3,
  })
}
</script>

<template>
  <BasePage :subtitle="entry?.headerText">
    <template #title>{{ entry?.documentNumber }}</template>

    <template #extra>
      <BaseButton
        v-if="!editMode"
        :disabled="editMode || entry?.isAudited || entry?.isReviewed"
        @click="editMode = true"
      >
        {{ t('action.edit') }}
      </BaseButton>
      <BaseButton v-if="editMode" category="primary" @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="editMode" @click="onCancel">{{ t('action.cancel') }}</BaseButton>
      <BaseButton v-if="!entry?.isAudited" :disabled="editMode" @click="onAction('audit')">
        {{ t('journal.entry.audit') }}
      </BaseButton>
      <BaseConfirmationButton v-if="entry?.isAudited" :disabled="editMode" @click="onAction('cancelAudit')">
        {{ t('journal.entry.cancelAudit') }}
      </BaseConfirmationButton>
      <BaseButton v-if="!entry?.isReviewed" :disabled="editMode" @click="onAction('review')">
        {{ t('journal.entry.review') }}
      </BaseButton>
      <BaseConfirmationButton v-if="entry?.isReviewed" :disabled="editMode" @click="onAction('cancelReview')">
        {{ t('journal.entry.cancelReview') }}
      </BaseConfirmationButton>
      <BaseButton
        v-if="entry?.isReviewed && entry.isAudited && !entry.isPosted"
        category="primary"
        @click="onAction('post')"
      >
        {{ t('journal.entry.post') }}
      </BaseButton>
    </template>

    <JournalEntryForm
      v-if="entry"
      ref="formRef"
      :disabled="!editMode"
      :header-text="entry.headerText"
      :attachment-quantity="entry.attachmentQuantity"
      :transaction-time="entry.transactionTime"
      :line-items="entry.lineItems"
      :creator="entry.creator.traits"
      :is-reviewed="entry.isReviewed"
      :is-audited="entry.isAudited"
      :is-posted="entry.isPosted"
    />
  </BasePage>
</template>
