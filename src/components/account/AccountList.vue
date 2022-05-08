<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Account, AccountService, Sob } from '../../domain'

export default defineComponent({
  props: {
    sob: {
      type: Object as PropType<Sob>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const accounts = ref<Account[]>()

    onMounted(async () => {
      accounts.value = await AccountService.getAllAccounts(props.sob.id)
    })

    return {
      t,
      accounts,
    }
  },
})
</script>

<template>
  <p v-for="account in accounts" :key="account.id">{{ account.title }}</p>
</template>
