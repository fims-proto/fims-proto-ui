<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { SidebarProvider } from '@/components/ui/sidebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'

interface ResizablePanelRef {
  resize: (size: number) => void
}

const MIN_SIZE = 33
const DEFAULT_LIST_SIZE = 50
const DEFAULT_MAIN_SIZE = 50

const route = useRoute()

const listPanelRef = ref<ResizablePanelRef | undefined>()
const mainPanelRef = ref<ResizablePanelRef | undefined>()

const hasList = computed(() => route.matched.some((r) => r.components?.list))
const hasMain = computed(() => route.matched.some((r) => r.components?.main))

const listPanelSize = computed(() => {
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const meta = route.matched[i]?.meta
    if (meta?.listPanelSize !== undefined) {
      return meta.listPanelSize
    }
  }
  if (!hasList.value) {
    return 0
  }
  if (!hasMain.value) {
    return 100
  }
  return DEFAULT_LIST_SIZE
})

const mainPanelSize = computed(() => {
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const meta = route.matched[i]?.meta
    if (meta?.mainPanelSize !== undefined) {
      return meta.mainPanelSize
    }
  }
  if (!hasMain.value) {
    return 0
  }
  if (!hasList.value) {
    return 100
  }
  return DEFAULT_MAIN_SIZE
})

// Auto-resize panels based on layout state
watch(
  [listPanelSize, mainPanelSize],
  ([newListSize, newMainSize]) => {
    // Use nextTick to ensure panels are mounted
    nextTick(() => {
      listPanelRef.value?.resize(newListSize)
      mainPanelRef.value?.resize(newMainSize)
    })
  },
  { immediate: true },
)
</script>

<template>
  <SidebarProvider class="h-full">
    <AppSidebar />
    <ResizablePanelGroup direction="horizontal" class="h-full w-full items-stretch">
      <!-- List -->
      <ResizablePanel v-if="hasList" ref="listPanelRef" :min-size="MIN_SIZE">
        <RouterView name="list" />
      </ResizablePanel>

      <ResizableHandle v-if="hasList && hasMain" with-handle />

      <!-- Main -->
      <ResizablePanel v-if="hasMain" ref="mainPanelRef" :min-size="MIN_SIZE">
        <RouterView name="main" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </SidebarProvider>
</template>
