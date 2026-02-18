<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { createCategoryColumns } from './columns'
import { AccountService, CreateAuxiliaryCategorySchema, type AuxiliaryCategory } from '@/services/general-ledger'
import type { Page } from '@/services/types'
import { useToastStore } from '@/store/toast'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()

const categories = ref<AuxiliaryCategory[]>([])
const page = ref<Page<AuxiliaryCategory>>()
const pageable = ref({ page: 1, size: 50 })
const isLoading = ref(false)
const dialogOpen = ref(false)

const columns = createCategoryColumns()

const form = useForm({
  validationSchema: toTypedSchema(CreateAuxiliaryCategorySchema),
})

watch(pageable.value, () => load(), { immediate: true })

async function load(refresh = false) {
  if (refresh) {
    categories.value = []
    if (pageable.value.page !== 1) {
      pageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  isLoading.value = true
  try {
    const { data } = await AccountService.getAuxiliaryCategories(props.sobId, pageable.value)

    if (data) {
      page.value = data
      categories.value = categories.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleRowClick(row: AuxiliaryCategory) {
  router.push({
    name: 'auxiliaryDetail',
    params: {
      sobId: props.sobId,
      categoryKey: row.key,
    },
  })
}

function openCreateDialog() {
  form.resetForm()
  dialogOpen.value = true
}

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  const { exception } = await AccountService.createAuxiliaryCategory(props.sobId, values)

  if (exception) return

  resetForm()
  toast.action.success(t('auxiliary.msg.categorySaveSuccess'))
  dialogOpen.value = false
  load(true)
})

function onDialogOpenChange(open: boolean) {
  dialogOpen.value = open
  if (!open) {
    form.resetForm()
  }
}
</script>

<template>
  <PageFrame :title="$t('auxiliary.categoryListTitle', [page?.numberOfElements ?? 0])" no-scroll>
    <template #end>
      <Button @click="openCreateDialog">{{ $t('action.create') }}</Button>
    </template>

    <DataTable
      :columns="columns"
      :data="categories"
      :row-count="page?.numberOfElements ?? 0"
      :has-more="categories.length < (page?.numberOfElements ?? 0)"
      :is-loading="isLoading"
      :on-row-click="handleRowClick"
      @load-more="pageable.page++"
    />
  </PageFrame>

  <!-- Create Category Dialog -->
  <Dialog :open="dialogOpen" @update:open="onDialogOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('auxiliary.createCategory') }}</DialogTitle>
        <DialogDescription>
          {{ $t('auxiliary.msg.createCategoryDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <VeeField v-slot="{ field, errors }" name="key">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="key">{{ $t('auxiliary.categoryKey') }}</FieldLabel>
            <Input id="key" type="text" v-bind="field" :aria-invalid="!!errors.length" />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <VeeField v-slot="{ field, errors }" name="title">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="title">{{ $t('auxiliary.categoryTitle') }}</FieldLabel>
            <Input id="title" type="text" v-bind="field" :aria-invalid="!!errors.length" />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>
      </form>

      <DialogFooter>
        <Button variant="ghost" @click="dialogOpen = false">{{ $t('common.cancel') }}</Button>
        <Button @click="onSubmit">{{ $t('action.save') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
