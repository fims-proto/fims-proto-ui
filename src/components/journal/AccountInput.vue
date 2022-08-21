<script setup lang="ts">
import { toRefs, ref, watch } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { Account, AccountService } from '../../domain'
import { useSobStore } from '../../store/sob'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const { workingSob } = toRefs(useSobStore().state)
const query = ref('')
const filteredAccounts = ref<Account[]>([])
const selectedAccount = ref<Account>()

watch(
  () => props.modelValue,
  async () => {
    if (!workingSob.value || !props.modelValue) {
      selectedAccount.value = undefined
      return
    }
    const { data } = await AccountService.getAccountByNumber(workingSob.value.id, props.modelValue)
    selectedAccount.value = data
  },
  { immediate: true }
)

watch(query, async () => {
  if (!workingSob.value || !query.value.trim()) {
    filteredAccounts.value = []
    return
  }
  const { data } = await AccountService.getAccountsStartsWithNumber(workingSob.value.id, query.value)
  filteredAccounts.value = data?.content ?? []
})

const onUpdate = (account: Account) => {
  selectedAccount.value = account
  emit('update:modelValue', account ? account.accountNumber : '')
}
</script>

<template>
  <div class="relative">
    <Combobox :model-value="selectedAccount" :disabled="disabled" nullable @update:model-value="onUpdate">
      <VBinder>
        <VTarget>
          <ComboboxInput
            :disabled="disabled"
            :display-value="(account: unknown) => (account ? (account as Account).accountNumber : '')"
            class="appearance-none w-full border-none px-3 py-2"
            @change="query = $event.target.value"
          />
        </VTarget>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-800/50">{{
          selectedAccount?.title
        }}</span>

        <VFollower :show="!disabled" placement="bottom-start">
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 -translate-y-2 opacity-0"
            enter-to-class="scale-100 translate-y-0 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 translate-y-0 opacity-100"
            leave-to-class="scale-95 -translate-y-2 opacity-0"
          >
            <ComboboxOptions
              v-show="filteredAccounts.length"
              class="max-h-60 min-w-[12rem] bg-white mt-1 border border-neutral-300 rounded-md shadow-lg overflow-auto"
            >
              <ComboboxOption
                v-for="account in filteredAccounts"
                v-slot="{ active }"
                :key="account.id"
                :value="account"
                as="template"
              >
                <li
                  :class="[
                    'p-2 bg-transparent text-sm cursor-pointer',
                    {
                      'bg-primary-700 text-white': active,
                    },
                  ]"
                >
                  {{ account.accountNumber }} - {{ account.title }}
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </transition>
        </VFollower>
      </VBinder>
    </Combobox>
  </div>
</template>
