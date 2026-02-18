<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toRefs } from 'vue'

import {
  BookOpenCheck,
  BookText,
  FileSpreadsheet,
  GitBranch,
  Network,
  NotebookText,
  RefreshCcwDot,
} from 'lucide-vue-next'
import type { SidebarProps } from '@/components/ui/sidebar'
import NavGroup from '@/components/sidebar/NavGroup.vue'
import NavUser from '@/components/sidebar/NavUser.vue'
import SobSwitcher from '@/components/sidebar/SobSwitcher.vue'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

import { useSobStore } from '@/store/sob'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const { t } = useI18n()
const router = useRouter()
const { workingSob } = toRefs(useSobStore().state)

const data = {
  scenarios: [
    {
      title: t('voucher.title'),
      icon: NotebookText,
      action: () => router.push({ name: 'voucherList', params: { sobId: workingSob.value?.id } }),
    },
    {
      title: t('ledger.title'),
      icon: BookText,
      action: () => router.push({ name: 'ledgerView', params: { sobId: workingSob.value?.id } }),
    },
    {
      title: t('period.close.title'),
      icon: BookOpenCheck,
      action: () => {},
    },
    {
      title: t('report.subjectName'),
      icon: FileSpreadsheet,
      action: () => router.push({ name: 'reportList', params: { sobId: workingSob.value?.id } }),
    },
  ],
  settings: [
    {
      title: t('nav.account'),
      icon: Network,
      action: () => router.push({ name: 'accountList', params: { sobId: workingSob.value?.id } }),
    },
    {
      title: t('nav.auxiliary'),
      icon: GitBranch,
      action: () => router.push({ name: 'auxiliaryList', params: { sobId: workingSob.value?.id } }),
    },
    {
      title: t('nav.initialize'),
      icon: RefreshCcwDot,
      action: () => router.push({ name: 'ledgerInitialize', params: { sobId: workingSob.value?.id } }),
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader
      class="flex h-[64px] content-center justify-center border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[50px]"
    >
      <SobSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavGroup :items="data.scenarios" :title="t('nav.scenarios')" />
      <NavGroup :items="data.settings" :title="t('nav.settings')" hide-on-collapse />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
