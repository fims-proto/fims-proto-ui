<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ColumnType } from '../reusable/table'

// table
const tablePage = ref({ currentPage: 1, totalElement: 55, pageSize: 10 })
const tableData = ref<{ company: string; contact: string; address: string; city: string }[]>([])
watch(
  [() => tablePage.value.currentPage, () => tablePage.value.pageSize],
  () => {
    tableData.value = []
    for (let i = 0; i < tablePage.value.pageSize; i++) {
      const index = Math.floor(Math.random() * 4)
      tableData.value.push({
        company: ['Google', 'Facebook', 'Twitter', 'Nokia'][index],
        contact: ['Donald', 'Michael', 'Trump', 'Json'][index],
        address: [
          'No. 699, Wangshang Road, Binjiang District',
          '1 Infinite Loop Cupertino, CA 95014',
          '	1600 Amphitheatre Parkway Mountain View, CA 94043',
          'Park Ridge, NJ 07656',
        ][index],
        city: ['New York', 'Kuerla', 'Helsinki', 'Cupertino'][index],
      })
    }
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
</script>

<template>
  <div class="container mx-auto rounded-lg p-4">
    <p>Empty table</p>
    <BaseTable :data-source="[]" :columns="tableColumns" />
    <br />

    <p>Table</p>
    <BaseTable
      :data-source="tableData"
      :columns="tableColumns"
      :free-search="true"
      :page="tablePage"
      @page="
        (pageable) => {
          tablePage.currentPage = pageable.page
          tablePage.pageSize = pageable.size ?? 10
        }
      "
    >
      <template #actions>
        <BaseButton size="S" category="primary">创建</BaseButton>
        <BaseButton size="S" category="flat">动作</BaseButton>
      </template>
    </BaseTable>
  </div>
</template>
