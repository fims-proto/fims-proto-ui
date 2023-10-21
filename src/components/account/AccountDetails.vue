<script setup lang="ts">
import { AccountService, usePadLevelNumber, type Account } from '../../domain'
import type { SelectItem } from '../reusable/form'
import { useNotificationStore } from '../../store/notification'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  sobId: string
  accountId: string
}>()

const { t } = useI18n()
const notificationStore = useNotificationStore()

const account = ref<Account>()
const superiorAccount = ref<Account | undefined>()
const accountTypeOptions = ref<string[]>(['assets', 'cost', 'liabilities', 'equity', 'profit_and_loss', 'common'])
const balanceDirectionOptions = ref<string[]>(['debit', 'credit'])
const auxiliaryCategoryOptions = ref<SelectItem[]>([])
const auxiliaryCategories = ref<SelectItem[]>([])
const levelNumber = usePadLevelNumber(
  () => account.value?.numberHierarchy.at(-1) as number,
  () => account.value?.level as number,
)

const editMode = ref<boolean>(false)

const labelAccountType = (v: string | undefined) => {
  switch (v) {
    case 'assets':
      return t('account.accountTypeEnum.assets')
    case 'cost':
      return t('account.accountTypeEnum.cost')
    case 'liabilities':
      return t('account.accountTypeEnum.liabilities')
    case 'equity':
      return t('account.accountTypeEnum.equity')
    case 'profit_and_loss':
      return t('account.accountTypeEnum.profit_and_loss')
    case 'common':
      return t('account.accountTypeEnum.common')
    default:
      return ''
  }
}

const labelbalanceDirection = (v: string | undefined) => {
  switch (v) {
    case 'debit':
      return t('account.balanceDirectionEnum.debit')
    case 'credit':
      return t('account.balanceDirectionEnum.credit')
    default:
      return ''
  }
}

const refreshAccount = async () => {
  ;({ data: account.value } = await AccountService.getAccountById(props.sobId, props.accountId))

  if (account.value?.superiorAccountId) {
    ;({ data: superiorAccount.value } = await AccountService.getAccountById(
      props.sobId,
      account.value.superiorAccountId,
    ))
  }

  auxiliaryCategories.value =
    account.value?.auxiliaryCategories?.map((category) => ({ value: category.key, label: category.title })) ?? []
}

const onCancel = async () => {
  editMode.value = false
  refreshAccount()
}

const onSave = async () => {
  if (!account.value) {
    return
  }

  const { exception } = await AccountService.updateAccount(props.sobId, props.accountId, {
    title: account.value.title,
    levelNumber: account.value.numberHierarchy.at(-1) as number,
    balanceDirection: account.value.balanceDirection,
    categoryKeys: auxiliaryCategories.value.map((c) => c.value),
  })

  if (!exception) {
    notificationStore.action.push({
      type: 'success',
      message: t('account.save.success'),
    })
  }

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
        <BaseSelect
          v-model="account.accountType"
          :display-value="labelAccountType"
          :options="accountTypeOptions"
          :option-key="(opt) => opt"
          :display-option="labelAccountType"
          disabled
        />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')" required>
        <BaseSelect
          v-model="account.balanceDirection"
          :display-value="labelbalanceDirection"
          :options="balanceDirectionOptions"
          :option-key="(opt) => opt"
          :display-option="labelbalanceDirection"
        />
      </BaseFormItem>

      <BaseFormItem :label="t('account.auxiliary.category')">
        <BaseSelect
          v-model="auxiliaryCategories"
          :display-value="(v) => v?.label"
          :options="auxiliaryCategoryOptions"
          :option-key="(opt) => opt?.value"
          :display-option="(opt) => opt?.label"
          multiple
        />
      </BaseFormItem>
    </BaseForm>
  </BasePage>
</template>
