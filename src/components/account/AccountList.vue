<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Page, Account, AccountService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const accounts = ref<Page<Account>>()

onMounted(async () => {
  accounts.value = await AccountService.getAllAccounts(props.sobId)
})
</script>

<template>
  <p v-for="account in accounts?.content" :key="account.id">{{ account.accountNumber }} - {{ account.title }}</p>
</template>
