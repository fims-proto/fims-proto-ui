<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ColumnType } from '../reusable/table'
import { useNotificationStore } from '../../store/notification'
import { FilterFactory } from '../../domain'

const notificationStore = useNotificationStore()

// table
const sampleData = (() => {
  const data = []
  for (let i = 0; i < 55; i++) {
    const index = Math.floor(Math.random() * 4)
    data.push({
      company: ['Google', 'Facebook', 'Twitter', 'Nokia'][index],
      contact: ['Donald', 'Michael', 'Trump', 'Json'][index],
      address: [
        'No. 699, Wangshang Road, Binjiang District',
        '1 Infinite Loop Cupertino, CA 95014',
        '1600 Amphitheatre Parkway Mountain View, CA 94043',
        'Park Ridge, NJ 07656',
      ][index],
      city: ['New York', 'Kuerla', 'Helsinki', 'Cupertino'][index],
      index: i,
    })
  }
  return data
})()
interface tableRow {
  company: string
  contact: string
  address: string
  city: string
  index: number
}
const tableData = ref<tableRow[]>([])
const tablePage = ref({ currentPage: 1, totalElement: 55, pageSize: 10 })
const searchQuery = ref('')
const filterEnabled = ref<boolean>(false)
const factory = new FilterFactory<tableRow>()
const filtereApiString = ref('')
const filterModelRef = ref<tableRow>({
  company: '',
  contact: '',
  address: '',
  city: '',
  index: -1,
})
watch(
  [
    () => tablePage.value.currentPage,
    () => tablePage.value.pageSize,
    () => searchQuery.value,
    () => filterEnabled.value,
    () => [
      filterModelRef.value.company,
      filterModelRef.value.city,
      filterModelRef.value.address,
      filterModelRef.value.contact,
    ],
  ],
  () => {
    const filter = filterEnabled.value
      ? factory.and(
          factory.and(
            factory.stw('company', filterModelRef.value.company),
            factory.stw('address', filterModelRef.value.address),
            factory.stw('contact', filterModelRef.value.contact),
            factory.stw('city', filterModelRef.value.city),
          ),
          factory.or(
            factory.ctn('company', searchQuery.value),
            factory.ctn('address', searchQuery.value),
            factory.ctn('city', searchQuery.value),
            factory.ctn('contact', searchQuery.value),
          ),
        )
      : factory.or(
          factory.ctn('company', searchQuery.value),
          factory.ctn('address', searchQuery.value),
          factory.ctn('city', searchQuery.value),
          factory.ctn('contact', searchQuery.value),
        )
    if (filter) filtereApiString.value = filter.apiFilterString()
    let filteredData = sampleData
    if (filter) {
      filteredData = sampleData.filter(filter.predicate)
    }
    tablePage.value.totalElement = filteredData.length

    tableData.value = filteredData.slice(
      (tablePage.value.currentPage - 1) * tablePage.value.pageSize,
      Math.min(tablePage.value.totalElement, tablePage.value.currentPage * tablePage.value.pageSize),
    )
  },
  { immediate: true },
)

const tableColumns: ColumnType[] = [
  {
    title: '公司',
    path: 'company',
    width: 'sm',
  },
  {
    title: '联系人',
    path: 'contact',
    width: 'md',
  },
  {
    title: '地址',
    path: 'address',
  },
  {
    title: '城市',
    path: 'city',
    width: 'lg',
  },
]

const onRowClick = (data: { company: string; contact: string; address: string; city: string }, i: number) => {
  notificationStore.action.push({
    type: 'info',
    message: `${data.company} on row ${i} clicked`,
    duration: 2,
  })
}

const onToggleEnableFilter = () => {
  filterEnabled.value = !filterEnabled.value
}
</script>

<template>
  <div class="container mx-auto rounded-lg p-4">
    <p>Empty table</p>
    <BaseTable :data-source="[]" :columns="tableColumns" :row-key="() => ''" />
    <br />

    <p>Empty table 2</p>
    <BaseTable :data-source="[]" :columns="tableColumns" title="空表测试" :row-key="() => ''" />
    <br />

    <p>Empty table 3</p>
    <BaseTable :data-source="[]" :columns="tableColumns" :row-key="() => ''" :free-search="filterEnabled">
      <template #actions>
        <BaseButton category="primary">创建</BaseButton>
        <BaseButton category="flat">动作</BaseButton>
      </template>
    </BaseTable>
    <br />

    <p>
      Table with Filter-api-string:<br />
      <span style="background-color: blanchedalmond">{{ filtereApiString }}</span>
    </p>
    <BaseTable
      id="filter_test_table"
      title="完整测试"
      :data-source="tableData"
      :columns="tableColumns"
      :row-key="(r) => r.index.toString()"
      free-search
      row-clickable
      :filter-enabled="filterEnabled"
      :page="tablePage"
      @search="(query) => (searchQuery = query)"
      @page="
        (pageable) => {
          tablePage.currentPage = pageable.page
          tablePage.pageSize = pageable.size ?? 10
        }
      "
      @row-click="onRowClick"
    >
      <template #actions>
        <BaseButton category="primary">创建</BaseButton>
        <BaseButton category="flat" @click="onToggleEnableFilter">筛选</BaseButton>
      </template>
      <template #filter="{ column }: { column: ColumnType }">
        <BaseInput v-if="column.path === 'company'" v-model="filterModelRef.company" />
        <BaseInput v-if="column.path === 'contact'" v-model="filterModelRef.contact" />
        <BaseInput v-if="column.path === 'address'" v-model="filterModelRef.address" />
        <BaseInput v-if="column.path === 'city'" v-model="filterModelRef.city" />
      </template>
    </BaseTable>
  </div>
</template>
