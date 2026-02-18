<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronsUpDown, Check, X } from 'lucide-vue-next'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useAccountStore } from '@/store/account'
import type { Account } from '@/services/general-ledger/account/types'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  id?: string
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<Account | undefined>()

const { t } = useI18n()
const { allAccounts } = useAccountStore().state

const open = ref(false)

// Get attrs without 'value' to avoid passing the Account object
const attrs = useAttrs()
const buttonAttrs = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { value, ...rest } = attrs
  return rest
})

const displayValue = computed(() => {
  if (model.value) {
    return `${model.value.accountNumber} - ${model.value.title}`
  }
  return props.placeholder || t('account.searchPlaceholder')
})

function handleSelect(account: Account) {
  // Toggle selection: if clicking the same account, clear it
  model.value = model.value?.id === account.id ? undefined : account
  open.value = false
}

function clearSelection() {
  model.value = undefined
}
</script>

<template>
  <div class="flex w-full gap-2">
    <div class="flex-1">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button
            :id="props.id"
            variant="outline"
            role="combobox"
            :aria-expanded="open"
            :disabled="props.disabled"
            v-bind="buttonAttrs"
            class="w-full justify-between font-normal"
          >
            <span :class="cn(!model && 'text-muted-foreground')" class="truncate">
              {{ displayValue }}
            </span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[var(--reka-popover-trigger-width)] p-0">
          <Command>
            <CommandInput :placeholder="$t('account.searchPlaceholder')" />
            <CommandList>
              <CommandEmpty>{{ $t('account.notFound') }}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  v-for="account in allAccounts"
                  :key="account.id"
                  :value="`${account.accountNumber} ${account.title}`"
                  @select="handleSelect(account)"
                >
                  <Check :class="cn('mr-2 h-4 w-4', model?.id === account.id ? 'opacity-100' : 'opacity-0')" />
                  <span class="font-medium">{{ account.accountNumber }}</span>
                  <span class="text-muted-foreground ml-2">{{ account.title }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

    <Button v-if="model && !props.disabled" type="button" variant="outline" size="icon" @click="clearSelection">
      <X class="h-4 w-4" />
    </Button>
  </div>
</template>
