<script setup lang="ts">
import { toRefs } from 'vue'
import { useColorMode } from '@vueuse/core'

import { BadgeCheck, ChevronsUpDown, LogOut, Moon, Sun, SunMoon } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useUserStore } from '@/store/user'
import { UserService } from '@/services/user'

const { isMobile } = useSidebar()
const mode = useColorMode()
const userStore = useUserStore()

const { user } = toRefs(userStore.state)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage src="" :alt="user.traits.name?.last" />
              <AvatarFallback class="rounded-lg">{{ user.traits.name?.last }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.traits.name?.first }}</span>
              <span class="truncate text-xs">{{ user.traits.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
          align="end"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage src="" :alt="user.traits.name?.last" />
                <AvatarFallback class="rounded-lg">{{ user.traits.name?.last }}</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.traits.name?.first }}</span>
                <span class="truncate text-xs">{{ user.traits.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <ToggleGroup v-model="mode" type="single" size="sm" class="w-full">
              <ToggleGroupItem value="light"><Sun /></ToggleGroupItem>
              <ToggleGroupItem value="dark"><Moon /></ToggleGroupItem>
              <ToggleGroupItem value="auto"><SunMoon /></ToggleGroupItem>
            </ToggleGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="() => $router.push({ name: 'profile' })">
              <BadgeCheck />
              {{ $t('nav.profile') }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="() => UserService.logout()">
            <LogOut />
            {{ $t('user.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
