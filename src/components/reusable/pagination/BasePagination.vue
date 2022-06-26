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

const current = ref(props.currentPage)
const size = ref(props.pageSize ?? 20)
const totalPage = computed(() => Math.ceil(props.totalElement / size.value))

const isFirst = () => current.value == 1
const isLast = () => current.value == totalPage.value

const onSelect = (targetPage: number) => {
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
  if (current.value > totalPage.value) {
    current.value = totalPage.value
  }
  emit('select', {
    page: current.value,
    size: size.value,
  })
}
</script>

<template>
  <div class="w-full flex gap-4 items-center justify-start">
    <!-- page number control -->
    <div class="flex gap-2 items-center">
      <BaseButton type="flat" :disabled="isFirst()" @click="onSelect(1)">
        <template #icon>
          <ChevronDoubleLeftSolidIcon />
        </template>
      </BaseButton>
      <BaseButton type="flat" :disabled="isFirst()" @click="onSelect(current - 1)">
        <template #icon>
          <ChevronLeftSolidIcon />
        </template>
      </BaseButton>
      <span class="w-16 text-center">
        {{ t('base.pagination.pageNumber', { currentPage: current, totalPage: totalPage }) }}
      </span>
      <BaseButton type="flat" :disabled="isLast()" @click="onSelect(current + 1)">
        <template #icon>
          <ChevronRightSolidIcon />
        </template>
      </BaseButton>
      <BaseButton type="flat" :disabled="isLast()" @click="onSelect(totalPage)">
        <template #icon>
          <ChevronDoubleRightSolidIcon />
        </template>
      </BaseButton>
    </div>

    <!-- page size selection -->
    <BaseDropdown @select="onSizeChange">
      <BaseDropdownButton
        as="a"
        class="px-3 py-2 space-x-2 whitespace-nowrap text-neutral-700 hover:text-primary-800 hover:bg-neutral-200/50"
      >
        {{ t('base.pagination.pageSize', [size]) }}
      </BaseDropdownButton>
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
