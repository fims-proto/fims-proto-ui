<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { JournalEntry, JournalService, Page, User } from '../../domain'
import { ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
}>()

const { t, d, n } = useI18n()
const router = useRouter()

const journalEnties = ref<Page<JournalEntry>>()

const pageable = ref({ page: 1, size: 10 })

const columns: ColumnType[] = [
  {
    title: t('journal.entry.transactionTime'),
    key: 'transactionTime',
    width: 'md',
  },
  {
    title: t('journal.entry.number'),
    key: 'number',
    width: 'sm',
  },
  {
    title: t('journal.entry.summary'),
    path: ['lineItems', '0', 'summary'],
  },
  {
    title: t('journal.entry.creator'),
    key: 'creator',
    width: 'sm',
  },
  {
    title: t('journal.entry.auditor'),
    key: 'auditor',
    width: 'sm',
  },
  {
    title: t('journal.entry.reviewer'),
    key: 'reviewer',
    width: 'sm',
  },
  {
    title: t('journal.entry.amount'),
    key: 'amount',
    align: 'right',
    width: 'md',
  },
]

watch(
  [() => pageable.value.page, () => pageable.value.size],
  async () => {
    const { data } = await JournalService.getJournalEntries(props.sobId, pageable.value)
    journalEnties.value = data
  },
  { immediate: true }
)

const getUserName = (user: User) =>
  user && user.traits
    ? t('common.userName', {
        lastName: user.traits.name?.last,
        firstName: user.traits.name?.first,
      })
    : ''

const onCreate = () => {
  router.push({
    name: 'journalEntryCreation',
    params: {
      sobId: props.sobId,
    },
  })
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('journal.entry.title') }}</template>
    <template #extra>
      <BaseButton category="primary" @click="onCreate">{{ t('action.create') }}</BaseButton>
    </template>

    <BaseTable
      :data-source="journalEnties?.content ?? []"
      :columns="columns"
      :page="{
        currentPage: journalEnties?.page ?? 1,
        totalElement: journalEnties?.numberOfElements ?? 0,
        pageSize: journalEnties?.size,
      }"
      @page="
        (target) => {
          pageable.page = target.page
          pageable.size = target.size ?? 10
        }
      "
    >
      <template #bodyCell="{ record, column }: { record: JournalEntry, column: ColumnType }">
        <template v-if="column.key === 'transactionTime'">
          <span>{{ d(record.transactionTime, 'date') }}</span>
        </template>

        <template v-else-if="column.key === 'number'">
          <BaseNavLink
            :to="{
              name: 'journalEntryDetail',
              params: {
                sobId: sobId,
                entryId: record.entryId,
              },
            }"
          >
            {{ record.documentNumber }}
          </BaseNavLink>
        </template>

        <template v-else-if="column.key === 'creator'">
          <span>{{ getUserName(record.creator) }}</span>
        </template>

        <template v-else-if="column.key === 'auditor'">
          <span>{{ getUserName(record.auditor) }}</span>
        </template>

        <template v-else-if="column.key === 'reviewer'">
          <span>{{ getUserName(record.reviewer) }}</span>
        </template>

        <template v-else-if="column.key === 'amount'">
          <span>{{ n(record.debit, 'decimal') }}</span>
        </template>
      </template>
    </BaseTable>
  </BasePage>
</template>
