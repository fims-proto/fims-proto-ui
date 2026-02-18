<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

defineProps<{
  title?: string
  items: {
    title: string
    action: () => void
    icon?: LucideIcon
  }[]
  hideOnCollapse?: boolean
}>()
</script>

<template>
  <SidebarGroup :class="{ 'group-data-[collapsible=icon]:hidden': hideOnCollapse }">
    <SidebarGroupLabel v-if="title">{{ title }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in items" :key="item.title">
        <SidebarMenuButton as-child :tooltip="item.title">
          <a role="button" @click.prevent="item.action">
            <component :is="item.icon" />
            <span>{{ item.title }}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
