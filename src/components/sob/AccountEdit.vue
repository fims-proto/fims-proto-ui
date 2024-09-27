<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AccountService,
  usePadLevelNumber,
  type Account,
  type AccountClass,
  type AuxiliaryCategory,
} from '../../domain'
import { AppForm, AppLabel, type FormItemState } from '../reusable/form'
import { useToastStore } from '../../store/toast'

const props = defineProps<{
  sobId: string
  accountId: string
}>()

const emit = defineEmits<{
  (event: 'update'): void
  (event: 'cancel'): void
}>()

const { t } = useI18n()
const toast = useToastStore()

const account = ref<Account>()
const superiorAccount = ref<Account | undefined>()
const classesAndGroups = ref<AccountClass[] | undefined>()
const auxiliaryCategoryOptions = ref<AuxiliaryCategory[]>()
const balanceDirectionOptions = ['debit', 'credit']
const itemState = ref<FormItemState>({})

const levelNumber = usePadLevelNumber(
  () => account.value?.numberHierarchy.at(-1) as number,
  () => account.value?.level as number,
)

const classOptions: Ref<string[]> = computed(() => classesAndGroups.value?.map((c) => c.id) ?? [])
const groupOptions: Ref<string[]> = computed(
  () => classesAndGroups.value?.find((c) => c.id === account.value?.class)?.groups ?? [],
)

const onSave = async () => {
  if (!account.value) {
    return
  }

  await AccountService.updateAccount(account.value.sobId, account.value.id, {
    title: account.value.title,
    levelNumber: Number(levelNumber.value),
    balanceDirection: account.value.balanceDirection,
    group: account.value.group,
    categoryKeys: account.value.auxiliaryCategories?.map((c) => c.key),
  })

  toast.action.add({ severity: 'success', summary: t('account.save.success') })

  emit('update')
}

onMounted(async () => {
  classesAndGroups.value = (await AccountService.getClasses(props.sobId)).data

  account.value = (await AccountService.getAccountById(props.sobId, props.accountId)).data

  if (account.value?.superiorAccountId) {
    superiorAccount.value = (
      await AccountService.getAccountById(account.value.sobId, account.value.superiorAccountId)
    ).data
  }

  auxiliaryCategoryOptions.value = (
    await AccountService.getAuxiliaryCategories(props.sobId, {
      page: 1,
      size: 999,
    })
  ).data?.content
})
</script>

<template>
  <AppForm v-if="account" @submit="onSave">
    <AppLabel required for="account-title-input">{{ t('account.accountTitle') }}</AppLabel>
    <InputText
      id="account-title-input"
      v-model="account.title"
      :invalid="itemState['accountTitle']?.invalid"
      aria-describedby="account-title-help"
      class="w-full"
    />
    <small v-if="itemState['accountTitle']?.message" id="account-title-help">
      {{ t(itemState['accountTitle'].message) }}
    </small>

    <AppLabel required for="account-number-input">{{ t('account.accountNumber') }}</AppLabel>
    <InputGroup v-if="superiorAccount">
      <InputGroupAddon>{{ superiorAccount.accountNumber }}</InputGroupAddon>
      <InputText
        id="account-number-input"
        v-model="levelNumber"
        :invalid="itemState['levelNumber']?.invalid"
        aria-describedby="account-number-help"
        class="w-full"
      />
    </InputGroup>
    <InputText
      v-else
      id="account-number-input"
      v-model="levelNumber"
      :invalid="itemState['levelNumber']?.invalid"
      aria-describedby="account-number-help"
      class="w-full"
    />
    <small v-if="itemState['levelNumber']?.message" id="account-number-help">
      {{ t(itemState['levelNumber'].message) }}
    </small>

    <AppLabel required for="account-class-input">{{ t('account.class') }}</AppLabel>
    <Select
      v-model="account.class"
      input-id="account-class-input"
      :options="classOptions"
      :option-label="(v: string) => t(`account.classEnum.${v}`)"
      disabled
      aria-describedby="account-class-help"
      class="w-full"
    />
    <small v-if="itemState['class']?.message" id="account-class-help">
      {{ t(itemState['class'].message) }}
    </small>

    <AppLabel required for="account-group-input">{{ t('account.group') }}</AppLabel>
    <Select
      v-model="account.group"
      input-id="account-group-input"
      :options="groupOptions"
      :option-label="(v: string) => t(`account.groupEnum.${v}`)"
      aria-describedby="account-group-help"
      class="w-full"
    />
    <small v-if="itemState['group']?.message" id="account-group-help">
      {{ t(itemState['group'].message) }}
    </small>

    <AppLabel required for="account-direction-input">{{ t('account.balanceDirection') }}</AppLabel>
    <Select
      v-model="account.balanceDirection"
      input-id="account-direction-input"
      :options="balanceDirectionOptions"
      :option-label="(v: string) => t(`account.balanceDirectionEnum.${v}`)"
      aria-describedby="account-direction-help"
      class="w-full"
    />
    <small v-if="itemState['balanceDirection']?.message" id="account-direction-help">
      {{ t(itemState['balanceDirection'].message) }}
    </small>

    <AppLabel for="account-auxiliary-category-input">{{ t('account.auxiliary.category') }}</AppLabel>
    <MultiSelect
      v-model="account.auxiliaryCategories"
      input-id="account-auxiliary-category-input"
      :options="auxiliaryCategoryOptions"
      :option-label="(aux: AuxiliaryCategory) => aux.title"
      filter
      class="w-full"
    />

    <div class="flex justify-end gap-2">
      <Button :label="t('action.cancel')" text severity="secondary" @click="$emit('cancel')" />
      <Button :label="t('action.save')" type="submit" />
    </div>
  </AppForm>
</template>
