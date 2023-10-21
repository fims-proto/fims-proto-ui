<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ColumnType } from '../reusable/table'
import { useNotificationStore } from '../../store/notification'

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
    })
  }
  return data
})()

const tableData = ref<{ company: string; contact: string; address: string; city: string }[]>([])
const tablePage = ref({ currentPage: 1, totalElement: 55, pageSize: 10 })
const searchQuery = ref('')

watch(
  [() => tablePage.value.currentPage, () => tablePage.value.pageSize, () => searchQuery.value],
  () => {
    const filteredData = sampleData.filter(
      (item) =>
        item.company.includes(searchQuery.value) ||
        item.contact.includes(searchQuery.value) ||
        item.address.includes(searchQuery.value) ||
        item.city.includes(searchQuery.value),
    )

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
    <BaseTable :data-source="[]" :columns="tableColumns" :row-key="() => ''" :free-search="true">
      <template #actions>
        <BaseButton category="primary">创建</BaseButton>
        <BaseButton category="flat">动作</BaseButton>
      </template>
    </BaseTable>
    <br />

    <p>Table</p>
    <BaseTable
      title="完整测试"
      :data-source="tableData"
      :columns="tableColumns"
      :row-key="(r) => Object.values(r).join('_')"
      free-search
      row-clickable
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
        <BaseButton category="flat">动作</BaseButton>
      </template>
    </BaseTable>
  </div>
</template>
