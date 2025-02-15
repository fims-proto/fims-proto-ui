<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SplitContainer } from '../reusable/split-container'
import { AppForm, AppLabel, type FormItemState } from '../reusable/form'
import type { Page } from '@domain/types'
import { AccountService, type AuxiliaryAccount, type AuxiliaryCategory } from '@domain/general-ledger'

type KeyTitle = {
  key: string
  title: string
  description?: string
}

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const auxiliaryCategories = ref<Page<AuxiliaryCategory>>()
const auxiliaryAccounts = ref<Page<AuxiliaryAccount>>()

const selectedCategory = ref<AuxiliaryCategory>()

const newCommonModel = ref<KeyTitle>({ key: '', title: '' })
const createMode = ref<'category' | 'account'>('category')
const createDialog = ref(false)
const dialogTitle = computed(() =>
  createMode.value === 'category'
    ? t('action.createObject', { object: t('account.auxiliary.category') })
    : t('action.createObject', { object: selectedCategory.value?.title }),
)
const itemState = ref<FormItemState>({})

const formRule = {
  key: {
    required: true,
  },
  title: {
    required: true,
  },
}

const initiateCategories = async (focusKey?: string) => {
  selectedCategory.value = undefined

  auxiliaryCategories.value = (
    await AccountService.getAuxiliaryCategories(props.sobId, {
      page: 1,
      size: 100,
    })
  ).data

  if (!auxiliaryCategories.value || auxiliaryCategories.value.numberOfElements == 0) {
    return
  }

  selectedCategory.value =
    auxiliaryCategories.value.content.find((cat) => cat.key === focusKey) ?? auxiliaryCategories.value.content[0]
}

const initiateAccounts = async () => {
  auxiliaryAccounts.value = undefined

  if (!selectedCategory.value) {
    return
  }

  auxiliaryAccounts.value = (
    await AccountService.getAuxiliaryAccounts(props.sobId, selectedCategory.value.key, {
      page: 1,
      size: 100,
    })
  ).data
}

const onOpenDialog = (mode: 'category' | 'account') => {
  createMode.value = mode
  createDialog.value = true
}

const onCreate = async () => {
  createDialog.value = false

  if (createMode.value === 'category') {
    await AccountService.createAuxiliaryCategory(props.sobId, newCommonModel.value)
    await initiateCategories(newCommonModel.value.key)
  } else if (selectedCategory.value) {
    await AccountService.createAuxiliaryAccount(props.sobId, selectedCategory.value.key, newCommonModel.value)
    await initiateAccounts()
  }

  // reset
  newCommonModel.value = { key: '', title: '' }
}

watch(() => props.sobId, initiateCategories, { immediate: true })
watch(selectedCategory, initiateAccounts, { immediate: true })
</script>

<template>
  <SplitContainer :open="!!selectedCategory">
    <template #left>
      <!-- auxiliary categroy -->
      <div>
        <Button :label="t('action.create')" @click="onOpenDialog('category')" />
      </div>
      <DataView :value="auxiliaryCategories?.content" data-key="key">
        <template #list="{ items }">
          <ul class="flex flex-col">
            <li v-for="(item, index) in items" :key="index" :class="{ 'border-surface-200 border-t': index !== 0 }">
              <Button :label="item.title" link @click="() => (selectedCategory = item)" />
            </li>
          </ul>
        </template>
      </DataView>
    </template>

    <template #right>
      <DataTable :value="auxiliaryAccounts?.content">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>{{ t('account.listTitle', [auxiliaryAccounts?.numberOfElements ?? 0]) }}</span>
            <Button :disabled="!selectedCategory" :label="t('action.create')" @click="onOpenDialog('account')" />
          </div>
        </template>
        <Column :header="t('account.auxiliary.key')" field="key" />
        <Column :header="t('account.auxiliary.account')" field="title" />
        <Column :header="t('account.auxiliary.description')" field="description" />
      </DataTable>
    </template>
  </SplitContainer>

  <Dialog v-model:visible="createDialog" :header="dialogTitle" :modal="true" :closable="false">
    <AppForm
      :model="newCommonModel"
      :rules="formRule"
      class="flex flex-col"
      @submit="onCreate"
      @item-state-change="(newState: FormItemState) => (itemState = newState)"
    >
      <AppLabel for="auxiliary-key-input" required>{{ t('account.auxiliary.key') }}</AppLabel>
      <InputText
        id="auxiliary-key-input"
        v-model.uppercase.trim="newCommonModel.key"
        :invalid="itemState['key']?.invalid"
        aria-describedby="auxiliary-key-help"
        class="w-full"
      />
      <small v-if="itemState['key']?.message" id="auxiliary-key-help">
        {{ t(itemState['key'].message) }}
      </small>

      <AppLabel for="auxiliary-title-input" required>{{ t('account.auxiliary.title') }}</AppLabel>
      <InputText
        id="auxiliary-title-input"
        v-model.trim="newCommonModel.title"
        :invalid="itemState['title']?.invalid"
        aria-describedby="auxiliary-title-help"
        class="w-full"
      />
      <small v-if="itemState['title']?.message" id="auxiliary-title-help">
        {{ t(itemState['title'].message) }}
      </small>

      <div v-if="createMode === 'account'">
        <AppLabel for="auxiliary-description-input">{{ t('account.auxiliary.description') }}</AppLabel>
        <InputText id="auxiliary-description-input" v-model.trim="newCommonModel.description" class="w-full" />
      </div>

      <div class="flex justify-end gap-2">
        <Button :label="t('action.cancel')" text severity="secondary" @click="createDialog = false" />
        <Button :label="t('action.save')" type="submit" />
      </div>
    </AppForm>
  </Dialog>
</template>
