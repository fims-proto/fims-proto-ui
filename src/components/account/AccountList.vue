<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Account, AccountService } from '../../domain';
import { useSobStore } from '../../store/sob';

export default defineComponent({
  setup() {
    const t = useI18n().t
    const sobStore = useSobStore()
    const accounts = ref<Account[]>()

    onMounted(async () => {
      if (!sobStore.state.workingSob) {
        throw 'invalid-working-sob'
      }
      accounts.value = await AccountService.getAllAccounts(sobStore.state.workingSob.id)
    })

    return {
      t,
      accounts
    }
  }
})
</script>

<template>
  <p v-for="account in accounts">{{ account.title }}</p>
</template>