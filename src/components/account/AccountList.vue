<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Account, AccountService, Page } from '../../domain'

export default defineComponent({
  props: {
    sobId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const accounts = ref<Page<Account>>()

    onMounted(async () => {
      accounts.value = await AccountService.getAllAccounts(props.sobId)
    })

    return {
      t,
      accounts,
    }
  },
})
</script>

<template>
  <p v-for="account in accounts?.content" :key="account.id">{{ account.accountNumber }} - {{ account.title }}</p>
</template>
