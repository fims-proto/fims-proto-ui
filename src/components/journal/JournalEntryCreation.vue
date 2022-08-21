<script setup lang="ts">
import { toRefs, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { JournalService, NewJournalEntry } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useSobStore } from '../../store/sob'
import { useUserStore } from '../../store/user'
import JournalEntryForm from './JournalEntryForm.vue'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()
const { userId, traits } = toRefs(useUserStore().state)
const { workingSob } = toRefs(useSobStore().state)

const formRef = ref<InstanceType<typeof JournalEntryForm>>()

const initEntry = () => ({
  transactionTime: new Date(),
  attachmentQuantity: 0,
  journalType: 'general_journal',
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

const newEntry = ref<NewJournalEntry>(initEntry())

const saveEntry = async () => {
  if (!workingSob.value) {
    alert('should not happen: invalid working sob')
    return
  }

  // collect form
  const toBeCreated = Object.assign({}, newEntry.value, formRef.value?.collect())

  if (toBeCreated.totalDebit !== toBeCreated.totalCredit) {
    notificationStore.action.push({
      type: 'error',
      message: t('journal.entry.save.notBalanced'),
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
      message: t('journal.entry.save.emptyItems'),
      duration: 5,
    })
    return
  }

  const { data, exception } = await JournalService.createJournalEntry(workingSob.value.id, toBeCreated)
  if (exception) {
    return
  }

  notificationStore.action.push({
    type: 'success',
    message: t('journal.entry.save.success'),
    duration: 3,
  })

  return data
}

const onSave = async () => {
  const createdEntry = await saveEntry()
  if (createdEntry) {
    router.push({
      name: 'journalEntryDetail',
      params: {
        sobId: props.sobId,
        entryId: createdEntry?.entryId,
      },
    })
  }
}

const onSaveAndNew = async () => {
  const createdEntry = await saveEntry()
  if (createdEntry) {
    newEntry.value = initEntry()
    formRef.value?.reset()
  }
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('journal.entry.creation.title') }}</template>
    <template #extra>
      <BaseButton category="primary" @click="onSaveAndNew">{{ t('action.saveAndNew') }}</BaseButton>
      <BaseButton @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton @click="$router.go(-1)">{{ t('action.cancel') }}</BaseButton>
    </template>
    <JournalEntryForm
      ref="formRef"
      :attachment-quantity="newEntry.attachmentQuantity"
      :transaction-time="newEntry.transactionTime"
      :line-items="newEntry.lineItems"
      :creator="traits"
    />
  </BasePage>
</template>
