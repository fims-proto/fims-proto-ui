<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountEdit from './AccountEdit.vue'
import { AccountService, type Account } from '@domain/general-ledger'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const accounts = ref<Account[]>()
const selectedAccount = ref<Account>()
const accountEditDialog = ref(false)

const refresh = async () => ({ data: accounts.value } = await AccountService.getAccounts(props.sobId))

const editAccount = (account: Account) => {
  selectedAccount.value = account
  accountEditDialog.value = true
}

const onAccountUpdated = async () => {
  accountEditDialog.value = false
  await refresh()
}

watch(() => props.sobId, refresh, { immediate: true })
</script>

<template>
  <DataTable :value="accounts ?? []">
    <Column :header="t('account.accountNumber')" field="accountNumber" />
    <Column :header="t('account.accountTitle')" field="title" />
    <Column :exportable="false">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" @click="editAccount(data)" />
      </template>
    </Column>
  </DataTable>

  <Dialog
    v-model:visible="accountEditDialog"
    :header="`${selectedAccount?.accountNumber} ${selectedAccount?.title}`"
    :modal="true"
    :closable="false"
  >
    <AccountEdit
      v-if="selectedAccount"
      :sob-id="selectedAccount.sobId"
      :account-id="selectedAccount.id"
      @update="onAccountUpdated"
      @cancel="() => (accountEditDialog = false)"
    />
  </Dialog>
</template>
