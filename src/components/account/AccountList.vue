<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Account, AccountService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const accounts = ref<Account[]>([])

onMounted(async () => {
  const { data } = await AccountService.getAllAccounts(props.sobId)
  accounts.value = data?.content ?? []
})
</script>

<template>
  <div v-if="accounts.length" class="w-full overflow-clip border border-neutral-300 shadow-lg rounded-md">
    <table class="w-full table-fixed">
      <tr class="bg-neutral-100">
        <th class="border-b border-neutral-200 py-2 px-4 text-left">{{ t('account.number') }}</th>
        <th class="border-b border-neutral-200 py-2 px-4 text-left">{{ t('account.title') }}</th>
      </tr>
      <tr
        v-for="account in accounts"
        :key="account.id"
        class="rounded-md hover:text-primary-700 hover:bg-neutral-200/50 hover:shadow-inner focus:outline-none focus:ring-inset focus:ring focus:ring-primary-500"
        tabindex="0"
      >
        <td class="border-t border-neutral-200 py-2 px-4 text-left">{{ account.accountNumber }}</td>
        <td class="border-t border-neutral-200 py-2 px-4 text-left">{{ account.title }}</td>
      </tr>
    </table>
  </div>
</template>
