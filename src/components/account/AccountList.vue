<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Page, Account, AccountService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const accounts = ref<Page<Account>>()

onMounted(async () => {
  const { data } = await AccountService.getAllAccounts(props.sobId)
  accounts.value = data
})
</script>

<template>
  <p v-for="account in accounts?.content" :key="account.id">{{ account.accountNumber }} - {{ account.title }}</p>
</template>
