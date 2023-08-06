<script setup lang="ts">
import { ref } from 'vue'
import { AccountService, type Account } from '../../domain'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  sobId: string
  accountId: string
}>()

const { t } = useI18n()

const account = ref<Account>()
const superiorAccount = ref<Account | undefined>()

onMounted(async () => {
  ;({ data: account.value } = await AccountService.getAccountById(props.sobId, props.accountId))

  if (account.value?.superiorAccountId) {
    ;({ data: superiorAccount.value } = await AccountService.getAccountById(
      props.sobId,
      account.value.superiorAccountId,
    ))
  }
})
</script>

<template>
  <BasePage :subtitle="account?.title">
    <template #title>{{ account?.accountNumber }}</template>

    <BaseForm v-if="account" :model="account" :edit="false" class="flex flex-col gap-4">
      <BaseFormItem v-if="superiorAccount" :label="t('account.superiorAccount')">
        <BaseInput v-model="superiorAccount.title" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountTitle')">
        <BaseInput v-model="account.title" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountNumber')">
        <BaseInput v-model="account.accountNumber" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')">
        <BaseInput v-model="account.accountType" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')">
        <BaseInput v-model="account.balanceDirection" />
      </BaseFormItem>
    </BaseForm>
  </BasePage>
</template>
