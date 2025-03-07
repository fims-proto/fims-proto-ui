<script setup lang="ts">
import { toRefs, ref, onMounted, watch } from 'vue'
import { AccountService } from '../../domain'
import { useSobStore } from '../../store/sob'
import BaseForm from '../reusable/form/BaseForm.vue'
import type { FormRules } from '../reusable/form'
import type { AccountInputAccount, AccountInputAuxiliaryAccount } from './types'
import { useFocusWithin } from '@vueuse/core'

const props = defineProps<{
  account: AccountInputAccount | undefined
  auxiliaryAccounts: AccountInputAuxiliaryAccount[] | undefined
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:account', value: AccountInputAccount | undefined): void
  (event: 'update:auxiliaryAccounts', value: AccountInputAuxiliaryAccount[] | undefined): void
}>()

const { workingSob } = toRefs(useSobStore().state)
const optionAccounts = ref<AccountInputAccount[]>([])

const containerRef = ref()
const { focused } = useFocusWithin(containerRef)

const openAuxiliaryForm = ref(false)
const auxiliaryFormRef = ref<InstanceType<typeof BaseForm>>()
const auxiliaryForm = ref<{
  options: { [categoryKey: string]: { categoryTitle: string; options: AccountInputAuxiliaryAccount[] } }
  model: { [categoryKey: string]: AccountInputAuxiliaryAccount | undefined }
  rules: FormRules
}>({ options: {}, model: {}, rules: {} })

const toggleAuxiliaryForm = ({ target = !openAuxiliaryForm.value, validate = true } = {}) => {
  if (Object.keys(auxiliaryForm.value.model).length === 0) {
    openAuxiliaryForm.value = false
    return
  }

  const closing = target === false

  // target status = false, means it's closing, verify form, and prevent close if validate failed
  if (closing && validate && !auxiliaryFormRef.value?.validate()) {
    return
  }

  openAuxiliaryForm.value = target
}

const refreshAuxiliaryForm = async (
  account: AccountInputAccount | undefined,
  auxiliaryAccounts: AccountInputAuxiliaryAccount[] | undefined,
) => {
  // clear form
  auxiliaryForm.value = { options: {}, model: {}, rules: {} }

  if (!account || !account.auxiliaryCategories) {
    return
  }

  for await (const category of account.auxiliaryCategories) {
    const options =
      (
        await AccountService.getAuxiliaryAccounts(workingSob.value?.id as string, category.key, {
          page: 1,
          size: 999,
        })
      ).data?.content ?? []
    auxiliaryForm.value.options[category.key] = { categoryTitle: category.title, options: options }
    auxiliaryForm.value.model[category.key] = auxiliaryAccounts?.find((a) => a.category.key === category.key)
    auxiliaryForm.value.rules[category.key] = { required: true }
  }
}

const onAccountQueryChange = async (query: string) => {
  if (!query.trim()) {
    optionAccounts.value = []
    return
  }
  const { data } = await AccountService.getAccountsStartsWithNumber(workingSob.value?.id as string, query)
  optionAccounts.value = data?.content ?? []

  toggleAuxiliaryForm({ target: false, validate: false })
}

const onAccountUpdate = async (a: AccountInputAccount | undefined) => {
  emit('update:account', a)
  emit(
    'update:auxiliaryAccounts',
    a?.auxiliaryCategories?.map((aux) => ({ key: '', title: '', category: aux })),
  )

  await refreshAuxiliaryForm(a, [])
  toggleAuxiliaryForm({ target: true })
}

const onAuxiliaryAccountUpdate = (categoryKey: string, auxiliaryAccount: AccountInputAuxiliaryAccount | undefined) => {
  if (!props.auxiliaryAccounts) {
    return
  }
  props.auxiliaryAccounts
    .filter((a) => a.category.key === categoryKey)
    .forEach((a) => {
      a.key = auxiliaryAccount?.key ?? ''
      a.title = auxiliaryAccount?.title ?? ''
    })

  emit('update:auxiliaryAccounts', props.auxiliaryAccounts)
}

onMounted(
  async () =>
    props.account && props.auxiliaryAccounts && (await refreshAuxiliaryForm(props.account, props.auxiliaryAccounts)),
)

watch(focused, (focused) => (focused ? toggleAuxiliaryForm({ target: true }) : toggleAuxiliaryForm({ target: false })))
watch(
  () => props.disabled,
  (disabled) => disabled && toggleAuxiliaryForm({ target: false, validate: false }),
)
</script>

<template>
  <div ref="containerRef" class="w-full relative">
    <AutocompleteInput
      :model-value="account"
      :disabled="disabled"
      :display-value="(v) => v?.accountNumber"
      :options="optionAccounts"
      :option-key="(opt) => opt?.accountNumber"
      :display-option="(opt) => (opt ? `${opt.accountNumber} - ${opt.title}` : '')"
      @change="(query) => onAccountQueryChange(query)"
      @update:model-value="onAccountUpdate"
    />

    <!-- titles -->
    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
      {{ [account?.title, auxiliaryAccounts?.map((a) => a.title).join(',')].join(' ') }}
    </span>

    <transition
      :appear="openAuxiliaryForm"
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 -translate-y-2 opacity-0"
      enter-to-class="scale-100 translate-y-0 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 translate-y-0 opacity-100"
      leave-to-class="scale-95 -translate-y-2 opacity-0"
    >
      <BaseForm
        v-show="openAuxiliaryForm"
        ref="auxiliaryFormRef"
        :model="auxiliaryForm.model"
        :rules="auxiliaryForm.rules"
        label-placement="left"
        label-width="4rem"
        class="absolute w-full flex flex-col gap-3 p-4 bg-neutral-50 border border-neutral-300 z-20"
      >
        <BaseFormItem
          v-for="(_, k) in auxiliaryForm.model"
          :key="k"
          :path="k as string"
          :label="auxiliaryForm.options[k].categoryTitle"
        >
          <BaseAutocomplete
            v-model="auxiliaryForm.model[k]"
            :disabled="disabled"
            :display-value="(v) => v && `${v?.key} - ${v?.title}`"
            :options="auxiliaryForm.options[k].options"
            :option-key="(opt) => opt?.key"
            :display-option="(opt) => (opt ? `${opt.key} - ${opt.title}` : '')"
            @update:model-value="(v) => onAuxiliaryAccountUpdate(k as string, v)"
          />
        </BaseFormItem>
        <button class="hidden" type="submit">submit</button>
      </BaseForm>
    </transition>
  </div>
</template>
