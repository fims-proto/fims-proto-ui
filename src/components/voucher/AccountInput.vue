<script lang="ts">
import { defineComponent, ref, toRefs, watch } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { Account, AccountService } from '../../domain'
import { useSobStore } from '../../store/sob'

export default defineComponent({
  components: { VBinder, VTarget, VFollower },
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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
        selectedAccount.value = await AccountService.getAccountByNumber(workingSob.value.id, props.modelValue)
      },
      { immediate: true }
    )

    watch(query, async () => {
      if (!workingSob.value || !query.value.trim()) {
        filteredAccounts.value = []
        return
      }
      const result = await AccountService.getAccountsStartsWithNumber(workingSob.value.id, query.value)
      filteredAccounts.value = result.content
    })

    const onUpdate = (account: Account) => {
      selectedAccount.value = account
      emit('update:modelValue', account ? account.accountNumber : '')
    }

    return {
      query,
      selectedAccount,
      filteredAccounts,
      onUpdate,
      displayAccountNumber: (account: unknown) => (account ? (account as Account).accountNumber : ''),
    }
  },
})
</script>

<template>
  <div class="relative">
    <combobox :model-value="selectedAccount" :disabled="disabled" nullable @update:model-value="onUpdate">
      <v-binder>
        <v-target>
          <combobox-input
            :disabled="disabled"
            :display-value="displayAccountNumber"
            class="appearance-none w-full border-none px-3 py-2"
            @change="query = $event.target.value"
          />
        </v-target>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-800/50">{{
          selectedAccount?.title
        }}</span>

        <v-follower :show="!disabled" placement="bottom-start">
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 -translate-y-2 opacity-0"
            enter-to-class="scale-100 translate-y-0 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 translate-y-0 opacity-100"
            leave-to-class="scale-95 -translate-y-2 opacity-0"
          >
            <combobox-options
              v-show="filteredAccounts.length"
              class="max-h-60 min-w-[12rem] bg-white mt-1 border border-neutral-300 rounded-md shadow-lg overflow-auto"
            >
              <combobox-option
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
              </combobox-option>
            </combobox-options>
          </transition>
        </v-follower>
      </v-binder>
    </combobox>
  </div>
</template>
