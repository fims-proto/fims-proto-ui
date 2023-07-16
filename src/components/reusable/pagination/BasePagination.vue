<script setup lang="ts">
import { computed, ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { useI18n } from 'vue-i18n'
import { type Pageable } from '../../../domain'

const props = defineProps<{
  currentPage: number
  totalElement: number
  pageSize?: number
  unitDescription?: string
}>()

const emit = defineEmits<{
  (event: 'select', pageable: Pageable): void
}>()

const { t } = useI18n()
const editingPage = ref(false)
const current = ref(props.currentPage)
const currentPageCache = ref(current.value)
const size = ref(props.pageSize ?? 20)
const totalPage = computed(() => Math.ceil(props.totalElement / size.value))

const isFirst = () => current.value == 1
const isLast = () => current.value == totalPage.value

const onSelect = (targetPage: number) => {
  editingPage.value = false
  if (targetPage > 0 && targetPage <= totalPage.value) {
    current.value = targetPage
    emit('select', {
      page: targetPage,
      size: size.value,
    })
  }
}

const onSizeChange = (targetSize: string) => {
  size.value = Number(targetSize)
  editingPage.value = false
  if (current.value > totalPage.value) {
    current.value = totalPage.value
  }
  emit('select', {
    page: current.value,
    size: size.value,
  })
}

const onUpdatePageCache = (event: Event) => {
  const val = (event.target as HTMLInputElement).value
  currentPageCache.value = Number(val)
}

const onKeyPress = (event: KeyboardEvent) => {
  if (/[^0-9]/g.test(event.key)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="w-full flex gap-4 items-center justify-start">
    <!-- page number control -->
    <div class="flex gap-2 items-center">
      <BaseButton category="flat" :disabled="isFirst()" @click="onSelect(1)">
        <template #icon>
          <ChevronDoubleLeftMiniIcon />
        </template>
      </BaseButton>
      <BaseButton category="flat" :disabled="isFirst()" @click="onSelect(current - 1)">
        <template #icon>
          <ChevronLeftMiniIcon />
        </template>
      </BaseButton>
      <div v-on-click-outside="($event) => onSelect(current)" class="flex h-8 items-center">
        <BaseButton v-if="!editingPage" category="flat" @click="editingPage = true">
          {{ t('base.pagination.pageNumber', { currentPage: current, totalPage: totalPage }) }}
        </BaseButton>
        <input
          v-if="editingPage"
          autofocus
          class="w-16 h-8 border-none m-0 bg-transparent text-sm underline outline-none focus:ring-0"
          type="number"
          inputmode="numeric"
          :value="current"
          :min="1"
          :max="totalPage"
          @keypress="onKeyPress"
          @input="onUpdatePageCache"
        />
        <BaseButton v-if="editingPage" category="flat" @click="onSelect(currentPageCache)">
          {{ t('base.pagination.confirmGotoPage') }}
        </BaseButton>
      </div>
      <BaseButton category="flat" :disabled="isLast()" @click="onSelect(current + 1)">
        <template #icon>
          <ChevronRightMiniIcon />
        </template>
      </BaseButton>
      <BaseButton category="flat" :disabled="isLast()" @click="onSelect(totalPage)">
        <template #icon>
          <ChevronDoubleRightMiniIcon />
        </template>
      </BaseButton>
    </div>

    <!-- page size selection -->
    <BaseDropdown @select="onSizeChange">
      <template #trigger>
        <BaseButton category="flat">
          {{ t('base.pagination.pageSize', [size]) }}
        </BaseButton>
      </template>

      <template #overlay>
        <BaseDropdownItem command="10">{{ t('base.pagination.pageSize', [10]) }}</BaseDropdownItem>
        <BaseDropdownItem command="20">{{ t('base.pagination.pageSize', [20]) }}</BaseDropdownItem>
        <BaseDropdownItem command="50">{{ t('base.pagination.pageSize', [50]) }}</BaseDropdownItem>
        <BaseDropdownItem command="100">{{ t('base.pagination.pageSize', [100]) }}</BaseDropdownItem>
      </template>
    </BaseDropdown>

    <!-- total element display -->
    <span class="ml-auto text-neutral-800/50">{{
      t('base.pagination.totalElement', {
        count: totalElement,
        unitDescription: unitDescription ?? t('base.pagination.defaultUnitDescription'),
      })
    }}</span>
  </div>
</template>

<style>
#pageJumpArea {
}
</style>
