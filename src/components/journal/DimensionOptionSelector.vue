<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DimensionService } from '@/services/dimension'
import type { DimensionCategoryRef, DimensionOptionRef } from '@/services/general-ledger/account/types'
import type { DimensionOption } from '@/services/dimension'
import { cn } from '@/lib/utils'

const props = defineProps<{
  category: DimensionCategoryRef
  sobId: string
  modelValue?: DimensionOptionRef
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DimensionOptionRef | undefined]
}>()

const { t } = useI18n()

const open = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const dimensionOptions = ref<DimensionOption[]>([])
const totalPages = ref(0)
const isLoading = ref(false)

const hasMore = computed(() => currentPage.value < totalPages.value)

async function loadDimensionOptions(query: string = '', page: number = 1) {
  isLoading.value = true
  const { data } = await DimensionService.getDimensionOptions(
    props.sobId,
    props.category.id,
    { page, size: 20 },
    query || undefined,
  )
  isLoading.value = false

  if (data) {
    if (page === 1) {
      dimensionOptions.value = data.content
    } else {
      dimensionOptions.value = [...dimensionOptions.value, ...data.content]
    }
    totalPages.value = data.totalPage
  }
}

const debouncedSearch = useDebounceFn((query: string) => {
  currentPage.value = 1
  loadDimensionOptions(query, 1)
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

watch(open, (isOpen) => {
  if (isOpen && dimensionOptions.value.length === 0) {
    loadDimensionOptions()
  }
})

function selectOption(option: DimensionOption) {
  const optionRef: DimensionOptionRef = {
    id: option.id,
    name: option.name,
    category: props.category,
  }
  emit('update:modelValue', optionRef)
  open.value = false
}

function loadMore() {
  currentPage.value++
  loadDimensionOptions(searchQuery.value, currentPage.value)
}

const displayText = computed(() => {
  if (props.modelValue) {
    return props.modelValue.name
  }
  return t('dimension.selectOption')
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        size="sm"
        :aria-expanded="open"
        :disabled="props.disabled"
        :class="cn('w-full justify-between font-normal', props.class)"
      >
        <span class="truncate">{{ displayText }}</span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-0" align="start">
      <Command>
        <CommandInput v-model="searchQuery" :placeholder="$t('dimension.selectOption')" />
        <CommandList>
          <CommandEmpty>
            {{ dimensionOptions.length === 0 ? $t('dimension.noOptions') : $t('common.noResults') }}
          </CommandEmpty>
          <CommandGroup v-if="dimensionOptions.length > 0">
            <CommandItem
              v-for="option in dimensionOptions"
              :key="option.id"
              :value="option"
              @select="() => selectOption(option)"
            >
              <Check :class="cn('mr-2 h-4 w-4', modelValue?.id === option.id ? 'opacity-100' : 'opacity-0')" />
              <span>{{ option.name }}</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup v-if="hasMore">
            <CommandItem :value="{ label: 'Load more' }" class="justify-center text-center" @select="loadMore">
              {{ isLoading ? $t('common.loading') : $t('common.loadMore', [currentPage, totalPages]) }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
