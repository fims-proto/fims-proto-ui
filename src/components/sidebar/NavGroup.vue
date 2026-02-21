<script setup lang="ts">
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { type LucideIcon, ChevronRight } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  icon?: LucideIcon
  to?: RouteLocationRaw
  defaultOpen?: boolean
  subItems?: {
    title: string
    icon?: LucideIcon
    to?: RouteLocationRaw
  }[]
}

defineProps<{
  title?: string
  items: NavItem[]
  hideOnCollapse?: boolean
}>()

const { state: sidebarState, isMobile } = useSidebar()
const router = useRouter()
const route = useRoute()

function subItemActive(item: NavItem) {
  return item.subItems?.some((sub) => router.resolve(sub.to!).fullPath === route.fullPath)
}
</script>

<template>
  <SidebarGroup :class="{ 'group-data-[collapsible=icon]:hidden': hideOnCollapse }">
    <SidebarGroupLabel v-if="title">{{ title }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- Nav item with sub items -->
        <template v-if="item.subItems?.length">
          <!-- Collapsible sub items in expanded mode -->
          <Collapsible
            v-if="sidebarState !== 'collapsed' || isMobile"
            as-child
            :default-open="item.defaultOpen"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton
                  :tooltip="item.title"
                  :class="{
                    'group-data-[state=closed]/collapsible:bg-primary group-data-[state=closed]/collapsible:text-primary-foreground transition-colors duration-200':
                      subItemActive(item),
                  }"
                >
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                  <ChevronRight
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <!-- Sub items -->
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="subItem in item.subItems" :key="subItem.title">
                    <SidebarMenuSubButton as-child>
                      <RouterLink
                        :to="subItem.to!"
                        exact-active-class="bg-primary text-primary-foreground! hover:text-sidebar-foreground! transition-colors duration-200"
                      >
                        <component :is="subItem.icon" v-if="subItem.icon" />
                        <span>{{ subItem.title }}</span>
                      </RouterLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <!-- Dropdown sub items in collapsed mode -->
          <DropdownMenu v-else>
            <SidebarMenuItem>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  :tooltip="item.title"
                  :class="{
                    'bg-primary text-primary-foreground transition-colors duration-200': subItemActive(item),
                  }"
                >
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent :side="isMobile ? 'bottom' : 'right'" :align="isMobile ? 'end' : 'start'">
                <DropdownMenuItem v-for="subItem in item.subItems" :key="subItem.title" as-child>
                  <RouterLink
                    :to="subItem.to!"
                    exact-active-class="bg-primary text-primary-foreground transition-colors duration-200"
                  >
                    <component :is="subItem.icon" v-if="subItem.icon" />
                    <span>{{ subItem.title }}</span>
                  </RouterLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </SidebarMenuItem>
          </DropdownMenu>
        </template>

        <!-- Nav item without sub items -->
        <SidebarMenuItem v-else>
          <SidebarMenuButton as-child :tooltip="item.title">
            <RouterLink
              :to="item.to!"
              exact-active-class="bg-primary text-primary-foreground transition-colors duration-200"
            >
              <component :is="item.icon" v-if="item.icon" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
