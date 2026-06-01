<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EditableField } from '@/components/common/form'
import { ConfirmationButton } from '@/components/common/confirmation'

import { createDimensionCategoryColumns } from './columns'
import { DimensionService, UpsertDimensionCategorySchema, type DimensionCategory } from '@/services/dimension'
import type { Page } from '@/services/types'
import { useToastStore } from '@/store/toast'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()

const categories = ref<DimensionCategory[]>([])
const page = ref<Page<DimensionCategory>>()
const pageable = ref({ page: 1, size: 50 })
const isLoading = ref(false)
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'update'>('create')
const selectedCategoryId = ref<string>()
const isEditing = ref(false)

const columns = computed(() => createDimensionCategoryColumns(openViewDialog))

const form = useForm({
  validationSchema: toTypedSchema(UpsertDimensionCategorySchema),
})

const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? t('dimension.createCategory') : t('dimension.updateCategory')
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
    const { data } = await DimensionService.getDimensionCategories(props.sobId, pageable.value)

    if (data) {
      page.value = data
      categories.value = categories.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleRowClick(row: DimensionCategory) {
  router.push({
    name: 'dimensionDetail',
    params: {
      sobId: props.sobId,
      categoryId: row.id,
    },
  })
}

async function openCreateDialog() {
  dialogMode.value = 'create'
  selectedCategoryId.value = undefined
  dialogOpen.value = true
  await nextTick()
  form.resetForm()
}

function openViewDialog(category: DimensionCategory) {
  dialogMode.value = 'update'
  selectedCategoryId.value = category.id
  form.resetForm({ values: category }, { force: true })
  isEditing.value = false
  dialogOpen.value = true
}

async function onDeleteCategory(categoryId?: string) {
  const category = categories.value.find((c) => c.id === categoryId)
  if (!category) return
  const { exception } = await DimensionService.deleteDimensionCategory(props.sobId, category.id)
  if (exception) return
  toast.action.success(t('dimension.msg.categoryDeleteSuccess'))
  dialogOpen.value = false
  load(true)
}

function onEditCategory() {
  isEditing.value = true
}

function onCancelCategoryEdit() {
  isEditing.value = false
  if (selectedCategoryId.value) {
    const category = categories.value.find((c) => c.id === selectedCategoryId.value)
    if (category) {
      form.resetForm({ values: category }, { force: true })
    }
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  if (dialogMode.value === 'create') {
    const { exception } = await DimensionService.createDimensionCategory(props.sobId, values)
    if (exception) return

    toast.action.success(t('dimension.msg.categorySaveSuccess'))
  } else {
    const { exception } = await DimensionService.updateDimensionCategory(props.sobId, selectedCategoryId.value!, values)
    if (exception) return

    toast.action.success(t('dimension.msg.categoryUpdateSuccess'))
  }

  dialogOpen.value = false
  load(true)
})

function onDialogOpenChange(open: boolean) {
  dialogOpen.value = open
  if (!open) {
    form.resetForm()
    isEditing.value = false
  }
}
</script>

<template>
  <PageFrame :title="$t('dimension.categoryListTitle', [page?.numberOfElements ?? 0])" no-scroll>
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

  <!-- Create/Update Category Dialog -->
  <Dialog :open="dialogOpen" @update:open="onDialogOpenChange">
    <DialogContent :aria-describedby="undefined">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <VeeField v-slot="{ field, errors }" name="name">
          <EditableField
            :label="$t('dimension.categoryName')"
            label-for="name"
            :is-editing="dialogMode === 'create' || isEditing"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <Input
                id="name"
                type="text"
                :model-value="value"
                :name="field.name"
                :aria-invalid="!!errors.length"
                @update:model-value="onUpdate"
                @blur="field.onBlur"
              />
            </template>
          </EditableField>
        </VeeField>

        <div v-if="dialogMode === 'update' && !isEditing && selectedCategoryId" class="text-muted-foreground text-sm">
          {{ $t('common.createdAt') }}:
          {{ $d(categories.find((c) => c.id === selectedCategoryId)!.createdAt, 'short') }}
        </div>
      </div>

      <DialogFooter>
        <template v-if="dialogMode === 'update' && !isEditing">
          <ConfirmationButton
            variant="destructive"
            :message="$t('dimension.msg.confirmDeleteCategory')"
            class="mr-auto"
            @confirm="onDeleteCategory(selectedCategoryId)"
          >
            {{ $t('action.delete') }}
          </ConfirmationButton>
          <Button variant="ghost" @click="onEditCategory">{{ $t('action.edit') }}</Button>
          <Button variant="ghost" @click="dialogOpen = false">{{ $t('action.close') }}</Button>
        </template>
        <template v-else-if="dialogMode === 'update' && isEditing">
          <Button variant="ghost" @click="onCancelCategoryEdit">{{ $t('action.cancel') }}</Button>
          <Button @click="onSubmit">{{ $t('action.save') }}</Button>
        </template>
        <template v-else>
          <Button variant="ghost" @click="dialogOpen = false">{{ $t('common.cancel') }}</Button>
          <Button @click="onSubmit">{{ $t('action.save') }}</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
