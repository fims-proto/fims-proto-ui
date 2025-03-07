<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AccountService, type Account, type Page, FilterFactory } from '../../domain'
import { type ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const accounts = ref<Page<Account>>()

const columns: ColumnType[] = [
  {
    title: t('account.accountNumber'),
    key: 'accountNumber',
    width: 'md',
  },
  {
    title: t('ledger.title'),
    path: 'title',
  },
]
type AccountClassSelectItem = {
  class: string
}

const selectedAccountClass = ref<AccountClassSelectItem>({ class: '1' })
const selectOptions: AccountClassSelectItem[] = [
  { class: '1' },
  { class: '2' },
  { class: '3' },
  { class: '4' },
  { class: '5' },
  { class: '7' },
]

const filterModelRef = ref({
  accountNumber: '',
  title: '',
})

const pageable = ref({ page: 1, size: 10 })
const filterEnabled = ref(false)
const filterApply = ref(0)
const factory = new FilterFactory<Account>()
watch(
  [
    () => pageable.value.page,
    () => pageable.value.size,
    () => filterApply.value,
    () => selectedAccountClass.value.class,
  ],
  async () => {
    const filter = factory.and(
      factory.stw('accountNumber', filterModelRef.value.accountNumber),
      factory.ctn('title', filterModelRef.value.title),
      factory.eq('class', selectedAccountClass.value.class),
    )

    const { data } = await AccountService.getAccounts(props.sobId, pageable.value, filter)

    accounts.value = data
  },
  { immediate: true },
)

const onToggleEnableFilter = () => {
  filterEnabled.value = !filterEnabled.value
}

const onApplyFilter = () => {
  filterApply.value += 1
}
</script>

<template>
  <BaseButtonGroup>
    <BaseButton
      v-for="opt in selectOptions"
      :key="opt.class"
      :category="opt.class === selectedAccountClass.class ? 'primary' : 'default'"
      @click="
        () => {
          selectedAccountClass.class = opt.class
        }
      "
      >{{ t('account.classEnum.' + opt.class) }}</BaseButton
    >
  </BaseButtonGroup>
  <div>
    <br />
  </div>
  <BaseTable
    :data-source="accounts?.content ?? []"
    :columns="columns"
    :row-key="(account) => account.id"
    row-clickable
    :filter-enabled="filterEnabled"
    :page="{
      currentPage: accounts?.pageNumber ?? 1,
      totalElement: accounts?.numberOfElements ?? 0,
      pageSize: accounts?.pageSize,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  >
    <template #actions>
      <BaseButton category="flat" @click="onToggleEnableFilter">筛选</BaseButton>
      <BaseButton v-if="filterEnabled" category="flat" @click="onApplyFilter">应用</BaseButton>
    </template>
    <template #filter="{ column }: { column: ColumnType }">
      <BaseInput v-if="column.key === 'accountNumber'" v-model="filterModelRef.accountNumber" html-type="search" />
      <BaseInput v-if="column.path === 'title'" v-model="filterModelRef.title" html-type="search" />
    </template>
    <template #bodyCell="{ record, column }: { record: Account; column: ColumnType }">
      <template v-if="column.key === 'accountNumber'">
        <BaseNavLink
          :to="{
            name: 'accountDetail',
            params: {
              sobId: sobId,
              accountId: record.id,
            },
          }"
        >
          {{ record.accountNumber }}
        </BaseNavLink>
      </template>
    </template>
  </BaseTable>
</template>
