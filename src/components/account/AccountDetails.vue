<script setup lang="ts">
import { ref } from 'vue'
import { AccountService, type Account } from '../../domain'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SelectOption } from '../reusable/form'

const props = defineProps<{
  sobId: string
  accountId: string
}>()

const { t } = useI18n()

const account = ref<Account>()
const superiorAccount = ref<Account | undefined>()
const auxiliaryCategoryOptions = ref<SelectOption[]>([])
const auxiliaryCategories = ref<string[]>([])

const editMode = ref<boolean>(false)

onMounted(async () => {
  ;({ data: account.value } = await AccountService.getAccountById(props.sobId, props.accountId))

  if (account.value?.superiorAccountId) {
    ;({ data: superiorAccount.value } = await AccountService.getAccountById(
      props.sobId,
      account.value.superiorAccountId,
    ))
  }

  auxiliaryCategories.value = account.value?.auxiliaryCategories?.map((category) => category.key) ?? []

  const { data: auxiliaryCategoryData } = await AccountService.getAuxiliaryCategories(props.sobId, {
    page: 1,
    size: 999,
  })
  auxiliaryCategoryOptions.value =
    auxiliaryCategoryData?.content.map((category) => ({
      value: category.key,
      label: category.title,
    })) ?? []
})
</script>

<template>
  <BasePage :subtitle="account?.title">
    <template #title>{{ account?.accountNumber }}</template>

    <template #extra>
      <BaseButton v-if="!editMode" @click="editMode = true">{{ t('action.edit') }}</BaseButton>
      <BaseButton v-if="editMode" category="primary" @click="editMode = false">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="editMode" @click="editMode = false">{{ t('action.cancel') }}</BaseButton>
    </template>

    <BaseForm v-if="account" :model="account" :edit="editMode" class="flex flex-col gap-4">
      <BaseFormItem v-if="superiorAccount" :label="t('account.superiorAccount')">
        <BaseInput v-model="superiorAccount.title" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountTitle')" required>
        <BaseInput v-model="account.title" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountNumber')" required>
        <BaseInput v-model="account.accountNumber" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')" required>
        <BaseInput v-model="account.accountType" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')" required>
        <BaseInput v-model="account.balanceDirection" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.auxiliaryCategory')">
        <BaseSelect v-model="auxiliaryCategories" :options="auxiliaryCategoryOptions" :multiple="true" />
      </BaseFormItem>
    </BaseForm>
  </BasePage>
</template>
