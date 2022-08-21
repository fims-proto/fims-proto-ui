<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AccountConfiguration, AccountService, Page } from '../../domain'
import { ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const accountConfigurations = ref<Page<AccountConfiguration>>()

const columns: ColumnType[] = [
  {
    title: t('account.accountNumber'),
    path: 'accountNumber',
    width: 'md',
  },
  {
    title: t('account.title'),
    path: 'title',
  },
]

const pageable = ref({ page: 1, size: 10 })

watch(
  [() => pageable.value.page, () => pageable.value.size],
  async () => {
    const { data } = await AccountService.getAccountConfigurations(props.sobId, pageable.value)
    accountConfigurations.value = data
  },
  { immediate: true }
)
</script>

<template>
  <BaseTable
    :data-source="accountConfigurations?.content ?? []"
    :columns="columns"
    :page="{
      currentPage: accountConfigurations?.page ?? 1,
      totalElement: accountConfigurations?.numberOfElements ?? 0,
      pageSize: accountConfigurations?.size,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  />
</template>
