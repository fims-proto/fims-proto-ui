<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, toRefs } from 'vue'
import { useRoute } from 'vue-router'

import {
  BookOpenCheck,
  ChartLine,
  FileSpreadsheet,
  GitBranch,
  HandCoins,
  LayoutDashboard,
  Network,
  RefreshCcwDot,
} from 'lucide-vue-next'
import type { SidebarProps } from '@/components/ui/sidebar'
import NavGroup from '@/components/sidebar/NavGroup.vue'
import NavUser from '@/components/sidebar/NavUser.vue'
import SobSwitcher from '@/components/sidebar/SobSwitcher.vue'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

import { useSobStore } from '@/store/sob'
import { usePeriodStore } from '@/store/period'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const { t } = useI18n()
const route = useRoute()
const { workingSob } = toRefs(useSobStore().state)
const { currentPeriod } = toRefs(usePeriodStore().state)

const dashboardItem = [{ title: t('nav.dashboard'), icon: LayoutDashboard, to: { name: 'home' } }]

const data = computed(() => {
  if (!workingSob.value || !currentPeriod.value) {
    return {
      scenarios: [],
      settings: [],
    }
  }
  return {
    scenarios: [
      {
        title: t('nav.transaction'),
        icon: HandCoins,
        to: { name: 'journalList', params: { sobId: workingSob.value.id } },
      },
      {
        title: t('nav.periodReview'),
        icon: BookOpenCheck,
        to: { name: 'periodDetail', params: { sobId: workingSob.value.id, periodId: currentPeriod.value.id } },
      },
      {
        title: t('nav.ledgerExplorer'),
        icon: ChartLine,
        to: {
          name: 'ledgerExplorer',
          params: { sobId: workingSob.value.id },
          query: {
            fromPeriod: route.query.fromPeriod as string | undefined,
            toPeriod: route.query.toPeriod as string | undefined,
          },
        },
      },
      {
        title: t('nav.report'),
        icon: FileSpreadsheet,
        to: { name: 'report', params: { sobId: workingSob.value.id } },
      },
    ],
    settings: [
      {
        title: t('nav.chartOfAccounts'),
        icon: Network,
        to: { name: 'accountList', params: { sobId: workingSob.value.id } },
      },
      {
        title: t('nav.dimension'),
        icon: GitBranch,
        to: { name: 'dimensionList', params: { sobId: workingSob.value.id } },
      },
      {
        title: t('nav.initialize'),
        icon: RefreshCcwDot,
        to: { name: 'ledgerInitialize', params: { sobId: workingSob.value.id } },
      },
    ],
  }
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader
      class="flex h-16 content-center justify-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12.5"
    >
      <SobSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavGroup :items="dashboardItem" :title="t('nav.start')" />
      <NavGroup :items="data.scenarios" :title="t('nav.scenarios')" />
      <NavGroup :items="data.settings" :title="t('nav.settings')" hide-on-collapse />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
