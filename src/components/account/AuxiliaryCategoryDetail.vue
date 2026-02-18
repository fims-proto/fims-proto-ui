<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import { createAccountColumns } from './columns'
import {
  AccountService,
  CreateAuxiliaryAccountSchema,
  type AuxiliaryCategory,
  type AuxiliaryAccount,
} from '@/services/general-ledger'
import type { Page } from '@/services/types'
import { useToastStore } from '@/store/toast'
import { EditableField } from '../common/form'

const props = defineProps<{
  sobId: string
  categoryKey: string
}>()

const { t } = useI18n()
const toast = useToastStore()
const router = useRouter()

const category = ref<AuxiliaryCategory>()
const accounts = ref<AuxiliaryAccount[]>([])
const accountPage = ref<Page<AuxiliaryAccount>>()
const accountPageable = ref({ page: 1, size: 20 })
const isLoadingAccounts = ref(false)
const accountDialogOpen = ref(false)
const accountDialogMode = ref<'create' | 'view'>('create')
const selectedAccount = ref<AuxiliaryAccount>()
const isEditing = ref(false)

const accountColumns = createAccountColumns()

const accountForm = useForm({
  validationSchema: toTypedSchema(CreateAuxiliaryAccountSchema),
})

const dialogTitle = computed(() => {
  if (accountDialogMode.value === 'create') {
    return t('auxiliary.createAccount')
  }
  return t('auxiliary.viewAccount')
})

watch(() => props.categoryKey, loadCategory, { immediate: true })
watch(accountPageable.value, () => loadAccounts())

async function loadCategory() {
  const { data } = await AccountService.getAuxiliaryCategoryByKey(props.sobId, props.categoryKey)
  if (data) {
    category.value = data
  }

  // Reset account pagination when category changes
  await loadAccounts(true)
}

async function loadAccounts(refresh = false) {
  if (refresh) {
    accounts.value = []
    if (accountPageable.value.page !== 1) {
      accountPageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  isLoadingAccounts.value = true
  try {
    const { data } = await AccountService.getAuxiliaryAccounts(props.sobId, props.categoryKey, {
      page: accountPageable.value.page,
      size: accountPageable.value.size,
    })

    if (data) {
      accountPage.value = data
      accounts.value = accounts.value.concat(data.content ?? [])
    }
  } finally {
    isLoadingAccounts.value = false
  }
}

function openCreateAccountDialog() {
  accountDialogMode.value = 'create'
  isEditing.value = true
  selectedAccount.value = undefined
  accountForm.resetForm()
  accountDialogOpen.value = true
}

function handleAccountRowClick(row: AuxiliaryAccount) {
  accountDialogMode.value = 'view'
  isEditing.value = false
  selectedAccount.value = row
  accountForm.resetForm({
    values: {
      key: row.key,
      title: row.title,
      description: row.description ?? '',
    },
  })
  accountDialogOpen.value = true
}

function onEditCategory() {
  isEditing.value = true
  toast.action.warn(t('auxiliary.msg.updateNotSupported'))
}

function onEditAccount() {
  isEditing.value = true
  toast.action.warn(t('auxiliary.msg.updateNotSupported'))
}

const onAccountSubmit = accountForm.handleSubmit(async (values, { resetForm }) => {
  if (accountDialogMode.value === 'view') {
    // Update not supported yet
    return
  }

  // Create new account
  const { exception } = await AccountService.createAuxiliaryAccount(props.sobId, props.categoryKey, values)

  if (exception) return

  resetForm()
  toast.action.success(t('auxiliary.msg.accountSaveSuccess'))
  accountDialogOpen.value = false
  loadAccounts(true)
})

function onAccountDialogOpenChange(open: boolean) {
  accountDialogOpen.value = open
  if (!open) {
    accountForm.resetForm()
    isEditing.value = false
    selectedAccount.value = undefined
  }
}

function onCancelAccount() {
  if (accountDialogMode.value === 'create') {
    accountDialogOpen.value = false
  } else {
    // View mode: close dialog
    accountDialogOpen.value = false
  }
}

function onClose() {
  router.push({ name: 'auxiliaryList', params: { sobId: props.sobId } })
}
</script>

<template>
  <PageFrame v-if="category" :secondary-title="$t('auxiliary.categoryDetail')" no-scroll>
    <template #end>
      <Button variant="outline" @click="onEditCategory">{{ $t('action.edit') }}</Button>
      <Button variant="ghost" @click="onClose">{{ $t('action.close') }}</Button>
    </template>

    <div class="flex h-full flex-col gap-4">
      <!-- Category Information -->
      <div class="mb-4 grid shrink-0 grid-cols-1 gap-2 md:grid-cols-2">
        <EditableField :label="$t('auxiliary.categoryKey')" :value="category.key" :is-editing="false" />
        <EditableField :label="$t('auxiliary.categoryTitle')" :value="category.title" :is-editing="false" />
      </div>

      <!-- Auxiliary Accounts Section -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ $t('auxiliary.accountsTitle', [accounts.length]) }}</h3>
        <Button variant="outline" @click="openCreateAccountDialog">{{ $t('action.create') }}</Button>
      </div>
      <Separator class="my-0.5" />

      <div class="min-h-0 flex-1">
        <DataTable
          :columns="accountColumns"
          :data="accounts"
          :row-count="accountPage?.numberOfElements ?? 0"
          :has-more="accounts.length < (accountPage?.numberOfElements ?? 0)"
          :is-loading="isLoadingAccounts"
          :on-row-click="handleAccountRowClick"
          @load-more="accountPageable.page++"
        />
      </div>
    </div>
  </PageFrame>

  <!-- Account Dialog (Create/View) -->
  <Dialog :open="accountDialogOpen" @update:open="onAccountDialogOpenChange">
    <DialogContent class="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{
            accountDialogMode === 'create'
              ? $t('auxiliary.msg.createAccountDescription')
              : $t('auxiliary.msg.viewAccountDescription')
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-4" @submit.prevent="onAccountSubmit">
        <VeeField v-slot="{ field, errors }" name="key">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="accountKey">{{ $t('auxiliary.accountKey') }}</FieldLabel>
            <Input
              id="accountKey"
              type="text"
              :disabled="accountDialogMode !== 'create' || !isEditing"
              v-bind="field"
              :aria-invalid="!!errors.length"
            />
            <FieldDescription v-if="accountDialogMode === 'create'">
              {{ $t('auxiliary.msg.keyImmutable') }}
            </FieldDescription>
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <VeeField v-slot="{ field, errors }" name="title">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="accountTitle">{{ $t('auxiliary.accountTitle') }}</FieldLabel>
            <Input
              id="accountTitle"
              type="text"
              :disabled="!isEditing"
              v-bind="field"
              :aria-invalid="!!errors.length"
            />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <VeeField v-slot="{ field, errors }" name="description">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="accountDescription">{{ $t('auxiliary.description') }}</FieldLabel>
            <Textarea
              id="accountDescription"
              :disabled="!isEditing"
              v-bind="field"
              :aria-invalid="!!errors.length"
              rows="3"
            />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <div v-if="accountDialogMode === 'view' && selectedAccount" class="text-muted-foreground text-sm">
          {{ $t('common.createdAt') }}: {{ $d(selectedAccount.createdAt, 'short') }}
        </div>
      </form>

      <DialogFooter>
        <template v-if="accountDialogMode === 'view'">
          <Button variant="ghost" @click="onEditAccount">{{ $t('action.edit') }}</Button>
          <Button @click="onCancelAccount">{{ $t('action.close') }}</Button>
        </template>
        <template v-else>
          <Button variant="ghost" @click="onCancelAccount">{{ $t('common.cancel') }}</Button>
          <Button @click="onAccountSubmit">{{ $t('action.save') }}</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
