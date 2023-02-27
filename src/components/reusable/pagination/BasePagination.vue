<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pageable } from '../../../domain'

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

const onUpdateModelValue = (value: number | string | Date) => {
  currentPageCache.value = Math.floor(value as number)
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
      <div class="flex items-center">
        <BaseButton v-if="!editingPage" category="flat" @click="editingPage = true">
          {{ t('base.pagination.pageNumber', { currentPage: current, totalPage: totalPage }) }}
        </BaseButton>
        <BaseInput
          v-if="editingPage"
          class="w-16"
          html-type="number"
          :model-value="current"
          :min="1"
          :max="totalPage"
          @update:model-value="onUpdateModelValue"
        />
        <BaseButtonGroup>
          <BaseButton v-if="editingPage" @click="onSelect(currentPageCache)">
            {{ t('base.pagination.confirmGotoPage') }}
          </BaseButton>
          <BaseButton v-if="editingPage" @click="onSelect(current)">
            {{ t('base.pagination.cancelGotoPage') }}
          </BaseButton>
        </BaseButtonGroup>
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
