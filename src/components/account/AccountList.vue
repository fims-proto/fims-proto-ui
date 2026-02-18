<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'

import { columns } from './columns'
import { treefyAccounts, type AccountTreeNode } from './treefy'
import { useAccountStore } from '@/store/account'
import { CLASS_OPTIONS, type Account } from '@/services/general-ledger'
import { ACCOUNT_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const accountStore = useAccountStore()
const bus = useEventBus(ACCOUNT_CHANGED)

bus.on(() => accountStore.action.refreshAccounts(props.sobId))

const accounts = computed<AccountTreeNode[]>(() => treefyAccounts(accountStore.state.allAccounts))

const handleRowClick = (row: Account) => {
  router.push({
    name: 'accountDetail',
    params: {
      accountId: row.id,
    },
  })
}
</script>

<template>
  <PageFrame :title="$t('account.listTitle', [accountStore.state.allAccounts.length])" no-scroll>
    <template #end>
      <Button @click="$router.push({ name: 'accountNew' })">{{ $t('action.create') }}</Button>
    </template>

    <DataTable
      :columns="columns"
      :data="accounts ?? []"
      :faceted-filters="[
        {
          name: 'class',
          title: $t(`account.class`),
          options: CLASS_OPTIONS.map((c) => ({ label: $t(`account.classEnum.${c}`), value: c })),
        },
      ]"
      :get-sub-rows="(row) => row.children"
      :on-row-click="handleRowClick"
    />
  </PageFrame>
</template>
