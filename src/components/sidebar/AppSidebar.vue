<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toRefs } from 'vue'

import {
  BookOpenCheck,
  ChartLine,
  FileSpreadsheet,
  GitBranch,
  HandCoins,
  Network,
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
const { workingSob } = toRefs(useSobStore().state)

const data = {
  scenarios: [
    {
      title: t('nav.transaction'),
      icon: HandCoins,
      to: { name: 'voucherList', params: { sobId: workingSob.value?.id } },
    },
    {
      title: t('nav.report'),
      icon: FileSpreadsheet,
      to: { name: 'reportList', params: { sobId: workingSob.value?.id } },
    },
    {
      title: t('nav.periodReview'),
      icon: BookOpenCheck,
      // TODO: to be implemented
      to: { name: 'home' },
    },
    {
      title: t('nav.ledgerExplorer'),
      icon: ChartLine,
      defaultOpen: true,
      subItems: [
        {
          title: t('nav.explorer.overview'),
          to: { name: 'ledgerOverview', params: { sobId: workingSob.value?.id } },
        },
        {
          title: t('nav.explorer.account'),
          to: { name: 'accountExplorer', params: { sobId: workingSob.value?.id } },
        },
        {
          title: t('nav.explorer.dimension'),
          to: { name: 'dimensionExplorer', params: { sobId: workingSob.value?.id } },
        },
      ],
    },
  ],
  settings: [
    {
      title: t('nav.chartOfAccounts'),
      icon: Network,
      to: { name: 'accountList', params: { sobId: workingSob.value?.id } },
    },
    {
      title: t('nav.dimension'),
      icon: GitBranch,
      to: { name: 'auxiliaryList', params: { sobId: workingSob.value?.id } },
    },
    {
      title: t('nav.initialize'),
      icon: RefreshCcwDot,
      to: { name: 'ledgerInitialize', params: { sobId: workingSob.value?.id } },
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
