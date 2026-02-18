<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { AccountService } from '@/services/general-ledger/account'
import type { AuxiliaryAccount, AuxiliaryCategory } from '@/services/general-ledger/account/types'
import { cn } from '@/lib/utils'

const props = defineProps<{
  category: AuxiliaryCategory
  sobId: string
  modelValue?: AuxiliaryAccount
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AuxiliaryAccount | undefined]
}>()

const { t } = useI18n()

const open = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const auxiliaryAccounts = ref<AuxiliaryAccount[]>([])
const totalPages = ref(0)
const isLoading = ref(false)

const hasMore = computed(() => currentPage.value < totalPages.value)

async function loadAuxiliaryAccounts(query: string = '', page: number = 1) {
  isLoading.value = true
  const { data } = await AccountService.getAuxiliaryAccounts(
    props.sobId,
    props.category.key,
    { page, size: 20 },
    query || undefined,
  )
  isLoading.value = false

  if (data) {
    if (page === 1) {
      auxiliaryAccounts.value = data.content
    } else {
      auxiliaryAccounts.value = [...auxiliaryAccounts.value, ...data.content]
    }
    totalPages.value = data.totalPage
  }
}

const debouncedSearch = useDebounceFn((query: string) => {
  currentPage.value = 1
  loadAuxiliaryAccounts(query, 1)
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

watch(open, (isOpen) => {
  if (isOpen && auxiliaryAccounts.value.length === 0) {
    loadAuxiliaryAccounts()
  }
})

function selectAccount(account: AuxiliaryAccount) {
  emit('update:modelValue', account)
  open.value = false
}

function loadMore() {
  currentPage.value++
  loadAuxiliaryAccounts(searchQuery.value, currentPage.value)
}

const displayText = computed(() => {
  if (props.modelValue) {
    return `${props.modelValue.key} - ${props.modelValue.title}`
  }
  return t('auxiliary.selectAccount')
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
        <CommandInput v-model="searchQuery" :placeholder="$t('auxiliary.selectAccount')" />
        <CommandList>
          <CommandEmpty>
            {{ auxiliaryAccounts.length === 0 ? $t('auxiliary.noAuxiliaryAccounts') : $t('common.noResults') }}
          </CommandEmpty>
          <CommandGroup v-if="auxiliaryAccounts.length > 0">
            <CommandItem
              v-for="account in auxiliaryAccounts"
              :key="account.key"
              :value="account"
              @select="() => selectAccount(account)"
            >
              <Check :class="cn('mr-2 h-4 w-4', modelValue?.key === account.key ? 'opacity-100' : 'opacity-0')" />
              <span class="font-medium">{{ account.key }}</span>
              <span class="text-muted-foreground ml-2">{{ account.title }}</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup v-if="hasMore">
            <CommandItem :value="{ label: 'Load more' }" class="justify-center text-center" @select="loadMore">
              {{ isLoading ? $t('common.loading') : $t('common.loadMore') }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
