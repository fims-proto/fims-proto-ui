<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronsUpDown, Plus } from 'lucide-vue-next'
import { LoadButton } from '@/components/common/list'

import { useSobStore } from '@/store/sob'
import type { Page } from '@/services/types'
import { SobService, type Sob } from '@/services/sob'
import { SOB_CHANGED } from '@/services/event'

const { t } = useI18n()
const { isMobile } = useSidebar()
const router = useRouter()
const sobStore = useSobStore()
const bus = useEventBus(SOB_CHANGED)

const sobs = ref<Sob[]>([])
const page = ref<Page<Sob>>()
const pageable = ref({ page: 1, size: 10 })

const { workingSob, currentPeriod } = toRefs(sobStore.state)
const sobText = computed(() => (workingSob.value ? workingSob.value.name : t('sob.sobUnselected')))
const periodText = computed(() =>
  currentPeriod.value
    ? t('period.periodText', [currentPeriod.value.fiscalYear, currentPeriod.value.periodNumber])
    : t('period.periodUnselected'),
)

watch(pageable.value, () => load(), { immediate: true })
bus.on(() => load(true))

async function load(refresh: boolean = false) {
  if (refresh) {
    pageable.value.page = 1
    sobs.value = []
  }
  page.value = (await SobService.searchSobs(pageable.value)).data
  sobs.value = sobs.value.concat(page.value?.content ?? [])
}

async function setActiveSob(sobId: string) {
  await sobStore.action.setWorkingSob(sobId)
  router.push({ name: 'home' })
}
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
            <div
              class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
            >
              <span class="italic">fi</span>
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">
                {{ sobText }}
              </span>
              <span class="truncate text-xs">{{ periodText }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-muted-foreground text-xs">{{ t('sob.title') }}</DropdownMenuLabel>
          <DropdownMenuItem v-for="sob in sobs" :key="sob.id" class="gap-2 p-2" @click="() => setActiveSob(sob.id)">
            <div class="flex size-6 items-center justify-center rounded-sm border">
              <Check v-if="sob.id === workingSob?.id" class="size-3.5 shrink-0" />
            </div>
            <span class="truncate">{{ sob.name }}</span>
          </DropdownMenuItem>

          <LoadButton :loaded="sobs.length" :total="page?.numberOfElements ?? 0" @click="pageable.page++" />

          <DropdownMenuSeparator />

          <DropdownMenuItem class="gap-2 p-2" @click="() => router.push({ name: 'sobList' })">
            <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus class="size-4" />
            </div>
            <div class="text-muted-foreground">{{ t('sob.manageSob') }}</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
