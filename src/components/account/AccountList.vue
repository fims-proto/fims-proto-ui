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
  {
    title: t('account.accountType'),
    key: 'accountType',
  },
]
type AccountTypeSelectItem = {
  type: string
}

const selectedValues = ref<AccountTypeSelectItem[]>([])
const selectOptions: AccountTypeSelectItem[] = [
  { type: 'assets' },
  { type: 'cost' },
  { type: 'liabilities' },
  { type: 'equity' },
  { type: 'common' },
]

const filterModelRef = ref({
  accountNumber: '',
  title: '',
  accountTypes: selectedValues.value,
})

const pageable = ref({ page: 1, size: 10 })
const filterEnabled = ref(false)
const filterApply = ref(0)
const factory = new FilterFactory<Account>()
watch(
  [() => pageable.value.page, () => pageable.value.size, () => filterApply.value],
  async () => {
    const selectedType = selectedValues.value.map((item) => item.type)
    const filter = factory.and(
      factory.stw('accountNumber', filterModelRef.value.accountNumber),
      factory.ctn('title', filterModelRef.value.title),
      factory.in('accountType', selectedType),
    )
    console.log(factory.in('accountType', selectedType)?.apiFilterString())

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
      <BaseInput v-if="column.key === 'accountNumber'" v-model="filterModelRef.accountNumber" />
      <BaseInput v-if="column.path === 'title'" v-model="filterModelRef.title" />
      <BaseSelect
        v-if="column.key === 'accountType'"
        v-model="selectedValues"
        :display-value="(v) => (v ? t('account.accountTypeEnum.' + v.type) : '')"
        :options="selectOptions"
        :option-key="(opt) => opt?.type"
        :display-option="(opt) => t('account.accountTypeEnum.' + opt?.type)"
        multiple
      />
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
      <template v-if="column.key === 'accountType'">
        <BaseForm>
          {{ t('account.accountTypeEnum.' + record.accountType) }}
        </BaseForm>
      </template>
    </template>
  </BaseTable>
</template>
