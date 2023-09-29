<script setup lang="ts">
import { ref } from 'vue'
import {
  AccountService,
  type NewAuxiliaryAccount,
  type AuxiliaryAccount,
  type AuxiliaryCategory,
  type NewAuxiliaryCategory,
  type Page,
} from '../../domain'
import { onMounted } from 'vue'
import type { ColumnType } from '../reusable/table'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const auxiliaryCategories = ref<Page<AuxiliaryCategory>>()
const auxiliaryAccounts = ref<Page<AuxiliaryAccount>>()

const accountColumns: ColumnType[] = [
  { title: t('account.auxiliary.key'), path: 'key', width: 'sm' },
  { title: t('account.auxiliary.account'), path: 'title' },
  { title: t('account.auxiliary.description'), path: 'description' },
]

const selectedCategory = ref<AuxiliaryCategory>()

const createCategoryOpened = ref(false)
const newCategory = ref<NewAuxiliaryCategory>({ key: '', title: '' })

const createAccountOpened = ref(false)
const newAccount = ref<NewAuxiliaryAccount>({ key: '', title: '' })

const formRule = {
  key: {
    required: true,
  },
  title: {
    required: true,
  },
}

const initiateCategories = async (focusKey?: string) => {
  ;({ data: auxiliaryCategories.value } = await AccountService.getAuxiliaryCategories(props.sobId, {
    page: 1,
    size: 100,
  }))

  if (!auxiliaryCategories.value || auxiliaryCategories.value.numberOfElements == 0) {
    return
  }

  if (!focusKey) {
    focusKey = auxiliaryCategories.value.content[0].key
  }
  selectedCategory.value = auxiliaryCategories.value.content.find((cat) => cat.key === focusKey)
}

const initiateAccounts = async () => {
  if (!selectedCategory.value) {
    return
  }

  ;({ data: auxiliaryAccounts.value } = await AccountService.getAuxiliaryAccountsByKey(
    props.sobId,
    selectedCategory.value.key,
    {
      page: 1,
      size: 100,
    },
  ))
}

const onCreateCategory = async () => {
  await AccountService.createAuxiliaryCategory(props.sobId, newCategory.value)
  createCategoryOpened.value = false
  await initiateCategories(newCategory.value.key)
  // reset
  newCategory.value = { key: '', title: '' }
}

const onCreateAccount = async () => {
  if (!selectedCategory.value) {
    return
  }

  await AccountService.createAuxiliaryAccount(props.sobId, selectedCategory.value.key, newAccount.value)
  createAccountOpened.value = false
  await initiateAccounts()
  // reset
  newAccount.value = { key: '', title: '' }
}

onMounted(initiateCategories)

watch(() => selectedCategory.value, initiateAccounts, { immediate: true })
</script>

<template>
  <BaseSplitPage detail-size="L">
    <template #main>
      <BaseList clickable hoverable :default-item="selectedCategory">
        <BaseListItem
          v-for="auxiliaryCategory in auxiliaryCategories?.content"
          :key="auxiliaryCategory.id"
          :value="auxiliaryCategory"
          @click="selectedCategory = auxiliaryCategory"
        >
          {{ auxiliaryCategory.title }}
        </BaseListItem>
      </BaseList>
      <BaseButton class="w-full mt-4" @click="createCategoryOpened = true">{{ t('action.create') }}</BaseButton>

      <!-- create category -->
      <BaseModal
        v-model:show="createCategoryOpened"
        :title="t('action.createObject', { object: t('account.auxiliary.category') })"
      >
        <BaseForm :model="newCategory" :rules="formRule" class="w-60 grid gap-4" @submit="onCreateCategory">
          <BaseFormItem path="key" :label="t('account.auxiliary.key')" required>
            <BaseInput v-model.uppercase.trim="newCategory.key" />
          </BaseFormItem>
          <BaseFormItem path="key" :label="t('account.auxiliary.title')" required>
            <BaseInput v-model.trim="newCategory.title" />
          </BaseFormItem>
          <BaseButton category="primary" html-type="submit" class="justify-self-end">
            {{ t('action.submit') }}
          </BaseButton>
        </BaseForm>
      </BaseModal>
    </template>

    <template #detail>
      <BaseTable
        :title="selectedCategory?.title"
        :data-source="auxiliaryAccounts?.content ?? []"
        :columns="accountColumns"
        :page="{
          currentPage: auxiliaryAccounts?.pageNumber ?? 1,
          totalElement: auxiliaryAccounts?.numberOfElements ?? 0,
          pageSize: auxiliaryAccounts?.pageSize,
        }"
      >
        <template #actions>
          <BaseButton v-if="selectedCategory" category="flat" @click="createAccountOpened = true">
            {{ t('action.create') }}
          </BaseButton>
        </template>
      </BaseTable>

      <!-- create account -->
      <BaseModal
        v-model:show="createAccountOpened"
        :title="t('action.createObject', { object: selectedCategory?.title })"
      >
        <BaseForm :model="newAccount" :rules="formRule" class="w-60 grid gap-4" @submit="onCreateAccount">
          <BaseFormItem path="key" :label="t('account.auxiliary.key')" required>
            <BaseInput v-model.uppercase.trim="newAccount.key" />
          </BaseFormItem>
          <BaseFormItem path="key" :label="t('account.auxiliary.title')" required>
            <BaseInput v-model.trim="newAccount.title" />
          </BaseFormItem>
          <BaseFormItem path="description" :label="t('account.auxiliary.description')">
            <BaseInput v-model.trim="newAccount.description" />
          </BaseFormItem>
          <BaseButton category="primary" html-type="submit" class="justify-self-end">
            {{ t('action.submit') }}
          </BaseButton>
        </BaseForm>
      </BaseModal>
    </template>
  </BaseSplitPage>
</template>
