<script setup lang="ts">
import { ref } from 'vue'
import { AccountService, usePadLevelNumber, type Account } from '../../domain'
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
const accountTypeOptions = ref<SelectOption[]>([
  { value: 'assets', label: t('account.accountTypeEnum.assets') },
  { value: 'cost', label: t('account.accountTypeEnum.cost') },
  { value: 'liabilities', label: t('account.accountTypeEnum.liabilities') },
  { value: 'equity', label: t('account.accountTypeEnum.equity') },
  { value: 'profit_and_loss', label: t('account.accountTypeEnum.profit_and_loss') },
  { value: 'common', label: t('account.accountTypeEnum.common') },
])
const balanceDirectionOptions = ref<SelectOption[]>([
  { value: 'debit', label: t('account.balanceDirectionEnum.debit') },
  { value: 'credit', label: t('account.balanceDirectionEnum.credit') },
])
const auxiliaryCategoryOptions = ref<SelectOption[]>([])
const auxiliaryCategories = ref<string[]>([])
const levelNumber = usePadLevelNumber(
  () => account.value?.numberHierarchy.at(-1) as number,
  () => account.value?.level as number,
)

const editMode = ref<boolean>(false)

const refreshAccount = async () => {
  ;({ data: account.value } = await AccountService.getAccountById(props.sobId, props.accountId))

  if (account.value?.superiorAccountId) {
    ;({ data: superiorAccount.value } = await AccountService.getAccountById(
      props.sobId,
      account.value.superiorAccountId,
    ))
  }

  auxiliaryCategories.value = account.value?.auxiliaryCategories?.map((category) => category.key) ?? []
}

const onCancel = async () => {
  editMode.value = false
  refreshAccount()
}

const onSave = async () => {
  if (!account.value) {
    return
  }

  await AccountService.updateAccount(props.sobId, props.accountId, {
    title: account.value.title,
    levelNumber: account.value.numberHierarchy.at(-1) as number,
    balanceDirection: account.value.balanceDirection,
    catgoryKeys: auxiliaryCategories.value,
  })

  editMode.value = false

  refreshAccount()
}

onMounted(async () => {
  refreshAccount()

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
      <BaseButton v-if="editMode" category="primary" @click="onSave">{{ t('action.save') }}</BaseButton>
      <BaseButton v-if="editMode" @click="onCancel">{{ t('action.cancel') }}</BaseButton>
    </template>

    <BaseForm v-if="account" :model="account" :edit="editMode" class="flex flex-col gap-4">
      <BaseFormItem v-if="superiorAccount" :label="t('account.superiorAccount')">
        <BaseInput v-model="superiorAccount.title" disabled />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountTitle')" required>
        <BaseInput v-model="account.title" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountNumber')" required>
        <BaseInput
          v-if="superiorAccount"
          :model-value="levelNumber"
          :prefix="superiorAccount.accountNumber"
          force-integer
          @update:model-value="(v) => account?.numberHierarchy.splice(-1, 1, Number(v))"
        />
        <BaseInput
          v-else
          :model-value="levelNumber"
          force-integer
          @update:model-value="(v) => account?.numberHierarchy.splice(-1, 1, Number(v))"
        />
      </BaseFormItem>

      <BaseFormItem :label="t('account.accountType')" required>
        <BaseSelect v-model="account.accountType" :options="accountTypeOptions" disabled />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')" required>
        <BaseSelect v-model="account.balanceDirection" :options="balanceDirectionOptions" />
      </BaseFormItem>

      <BaseFormItem :label="t('account.auxiliary.category')">
        <BaseSelect v-model="auxiliaryCategories" :options="auxiliaryCategoryOptions" :multiple="true" />
      </BaseFormItem>
    </BaseForm>
  </BasePage>
</template>
