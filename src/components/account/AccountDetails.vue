<script setup lang="ts">
import { AccountService, usePadLevelNumber, type Account, type AccountClass } from '../../domain'
import type { SelectItem } from '../reusable/form'
import { useNotificationStore } from '../../store/notification'
import { ref, onMounted, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps<{
  sobId: string
  accountId: string
}>()

const { t } = useI18n()
const notificationStore = useNotificationStore()

const account = ref<Account>()
const superiorAccount = ref<Account | undefined>()
const classesAndGroups = ref<AccountClass[] | undefined>()
const balanceDirectionOptions = ref<string[]>(['debit', 'credit'])
const auxiliaryCategoryOptions = ref<SelectItem[]>([])
const auxiliaryCategories = ref<SelectItem[]>([])
const levelNumber = usePadLevelNumber(
  () => account.value?.numberHierarchy.at(-1) as number,
  () => account.value?.level as number,
)

const editMode = ref<boolean>(false)

const classOptions: Ref<string[]> = computed(() => classesAndGroups.value?.map((c) => c.id) ?? [])
const groupOptions: Ref<string[]> = computed(
  () => classesAndGroups.value?.find((c) => c.id === account.value?.class)?.groups ?? [],
)

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
    group: account.value.group,
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
  classesAndGroups.value = (await AccountService.getClasses(props.sobId)).data

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

      <BaseFormItem :label="t('account.class')" required>
        <BaseSelect
          v-model="account.class"
          :display-value="(v) => t(`account.classEnum.${v}`)"
          :options="classOptions"
          :option-key="(opt) => opt"
          :display-option="(v) => t(`account.classEnum.${v}`)"
          disabled
        />
      </BaseFormItem>

      <BaseFormItem :label="t('account.group')" required>
        <BaseSelect
          v-model="account.group"
          :display-value="(v) => t(`account.groupEnum.${v}`)"
          :options="groupOptions"
          :option-key="(opt) => opt"
          :display-option="(v) => t(`account.groupEnum.${v}`)"
        />
      </BaseFormItem>

      <BaseFormItem :label="t('account.balanceDirection')" required>
        <BaseSelect
          v-model="account.balanceDirection"
          :display-value="(v) => t(`account.balanceDirectionEnum.${v}`)"
          :options="balanceDirectionOptions"
          :option-key="(opt) => opt"
          :display-option="(v) => t(`account.balanceDirectionEnum.${v}`)"
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
