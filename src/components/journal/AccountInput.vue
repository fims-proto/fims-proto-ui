<script setup lang="ts">
import { toRefs, ref, watch } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { AccountConfiguration, AccountService } from '../../domain'
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
const filteredAccountConfigurations = ref<AccountConfiguration[]>([])
const selectedAccountConfiguration = ref<AccountConfiguration>()

watch(
  () => props.modelValue,
  async () => {
    if (!workingSob.value || !props.modelValue) {
      selectedAccountConfiguration.value = undefined
      return
    }
    const { data } = await AccountService.getAccountConfigurationByAccountNumber(workingSob.value.id, props.modelValue)
    selectedAccountConfiguration.value = data
  },
  { immediate: true }
)

watch(query, async () => {
  if (!workingSob.value || !query.value.trim()) {
    filteredAccountConfigurations.value = []
    return
  }
  const { data } = await AccountService.getAccountConfigurationsStartsWithNumber(workingSob.value.id, query.value)
  filteredAccountConfigurations.value = data?.content ?? []
})

const onUpdate = (config: AccountConfiguration) => {
  selectedAccountConfiguration.value = config
  emit('update:modelValue', config ? config.accountNumber : '')
}
</script>

<template>
  <div class="w-full relative">
    <Combobox :model-value="selectedAccountConfiguration" :disabled="disabled" nullable @update:model-value="onUpdate">
      <VBinder>
        <VTarget>
          <ComboboxInput
            :disabled="disabled"
            :display-value="(account: unknown) => (account ? (account as AccountConfiguration).accountNumber : '')"
            class="appearance-none w-full border-none px-3 py-2"
            @change="query = $event.target.value"
          />
        </VTarget>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-800/50">{{
          selectedAccountConfiguration?.title
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
              v-show="filteredAccountConfigurations.length"
              class="max-h-60 min-w-[12rem] bg-white mt-1 border border-neutral-300 rounded-md shadow-lg overflow-auto"
            >
              <ComboboxOption
                v-for="config in filteredAccountConfigurations"
                v-slot="{ active }"
                :key="config.accountId"
                :value="config"
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
                  {{ config.accountNumber }} - {{ config.title }}
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </transition>
        </VFollower>
      </VBinder>
    </Combobox>
  </div>
</template>
