<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
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
import { Input } from '@/components/ui/input'
import { EditableField } from '@/components/common/form'
import { ConfirmationButton } from '@/components/common/confirmation'

import { createDimensionOptionColumns } from './columns'
import {
  DimensionService,
  UpsertDimensionOptionSchema,
  type DimensionCategory,
  type DimensionOption,
} from '@/services/dimension'
import type { Page } from '@/services/types'
import { useToastStore } from '@/store/toast'

const props = defineProps<{
  sobId: string
  categoryId: string
}>()

const { t } = useI18n()
const toast = useToastStore()
const router = useRouter()

const category = ref<DimensionCategory>()
const options = ref<DimensionOption[]>([])
const optionPage = ref<Page<DimensionOption>>()
const optionPageable = ref({ page: 1, size: 20 })
const optionDialogOpen = ref(false)
const optionDialogMode = ref<'create' | 'update'>('create')
const selectedOptionId = ref<string>()
const isEditingOption = ref(false)

const optionColumns = createDimensionOptionColumns()

const form = useForm({
  validationSchema: toTypedSchema(UpsertDimensionOptionSchema),
})

const optionDialogTitle = computed(() => {
  return optionDialogMode.value === 'create' ? t('dimension.createOption') : t('dimension.updateOption')
})

watch(() => props.categoryId, loadCategory, { immediate: true })
watch(optionPageable.value, () => loadOptions())

async function loadCategory() {
  const { data } = await DimensionService.getDimensionCategoryById(props.sobId, props.categoryId)
  if (data) {
    category.value = data
  }
  await loadOptions(true)
}

async function loadOptions(refresh = false) {
  if (refresh) {
    options.value = []
    if (optionPageable.value.page !== 1) {
      optionPageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  const { data } = await DimensionService.getDimensionOptions(props.sobId, props.categoryId, {
    page: optionPageable.value.page,
    size: optionPageable.value.size,
  })

  if (data) {
    optionPage.value = data
    options.value = options.value.concat(data.content ?? [])
  }
}

async function openCreateOptionDialog() {
  optionDialogMode.value = 'create'
  selectedOptionId.value = undefined
  optionDialogOpen.value = true
  await nextTick()
  form.resetForm()
}

function handleOptionRowClick(row: DimensionOption) {
  optionDialogMode.value = 'update'
  selectedOptionId.value = row.id
  form.resetForm({ values: row }, { force: true })
  isEditingOption.value = false
  optionDialogOpen.value = true
}

const onOptionSubmit = form.handleSubmit(async (values) => {
  if (optionDialogMode.value === 'create') {
    const { exception } = await DimensionService.createDimensionOption(props.sobId, props.categoryId, values)
    if (exception) return

    toast.action.success(t('dimension.msg.optionSaveSuccess'))
  } else {
    const { exception } = await DimensionService.updateDimensionOption(
      props.sobId,
      props.categoryId,
      selectedOptionId.value!,
      values,
    )
    if (exception) return

    toast.action.success(t('dimension.msg.optionUpdateSuccess'))
  }

  optionDialogOpen.value = false
  loadOptions(true)
})

async function onDeleteOption() {
  if (!selectedOptionId.value) return
  const { exception } = await DimensionService.deleteDimensionOption(
    props.sobId,
    props.categoryId,
    selectedOptionId.value,
  )
  if (exception) return
  toast.action.success(t('dimension.msg.optionDeleteSuccess'))
  optionDialogOpen.value = false
  loadOptions(true)
}

function onOptionDialogOpenChange(open: boolean) {
  optionDialogOpen.value = open
  if (!open) {
    form.resetForm()
    isEditingOption.value = false
    selectedOptionId.value = undefined
  }
}

function onEditOption() {
  isEditingOption.value = true
}

function onCancelOptionEdit() {
  isEditingOption.value = false
  if (selectedOptionId.value) {
    const option = options.value.find((o) => o.id === selectedOptionId.value)
    if (option) {
      form.resetForm({ values: option }, { force: true })
    }
  }
}

function onClose() {
  router.push({ name: 'dimensionList', params: { sobId: props.sobId } })
}
</script>

<template>
  <PageFrame v-if="category" :secondary-title="$t('dimension.optionsTitle', [category.name, options.length])" no-scroll>
    <template #end>
      <Button variant="outline" @click="openCreateOptionDialog">{{ $t('action.create') }}</Button>
      <Button variant="ghost" @click="onClose">{{ $t('action.close') }}</Button>
    </template>

    <DataTable
      :columns="optionColumns"
      :data="options"
      :row-count="optionPage?.numberOfElements ?? 0"
      :has-more="options.length < (optionPage?.numberOfElements ?? 0)"
      :on-row-click="handleOptionRowClick"
      @load-more="optionPageable.page++"
    />
  </PageFrame>

  <!-- Option Dialog (Create/Update) -->
  <Dialog :open="optionDialogOpen" @update:open="onOptionDialogOpenChange">
    <DialogContent class="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ optionDialogTitle }}</DialogTitle>
        <DialogDescription>
          {{
            optionDialogMode === 'create'
              ? $t('dimension.msg.createOptionDescription')
              : $t('dimension.msg.updateOptionDescription')
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <VeeField v-slot="{ field, errors }" name="name">
          <EditableField
            :label="$t('dimension.optionName')"
            label-for="optionName"
            :is-editing="optionDialogMode === 'create' || isEditingOption"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <Input
                id="optionName"
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

        <div
          v-if="optionDialogMode === 'update' && !isEditingOption && selectedOptionId"
          class="text-muted-foreground text-sm"
        >
          {{ $t('common.createdAt') }}: {{ $d(options.find((o) => o.id === selectedOptionId)!.createdAt, 'short') }}
        </div>
      </div>

      <DialogFooter>
        <template v-if="optionDialogMode === 'update' && !isEditingOption">
          <ConfirmationButton
            variant="destructive"
            :message="$t('dimension.msg.confirmDeleteOption')"
            class="mr-auto"
            @confirm="onDeleteOption"
          >
            {{ $t('action.delete') }}
          </ConfirmationButton>
          <Button variant="ghost" @click="onEditOption">{{ $t('action.edit') }}</Button>
          <Button variant="ghost" @click="optionDialogOpen = false">{{ $t('action.close') }}</Button>
        </template>
        <template v-else-if="optionDialogMode === 'update' && isEditingOption">
          <Button variant="ghost" @click="onCancelOptionEdit">{{ $t('action.cancel') }}</Button>
          <Button @click="onOptionSubmit">{{ $t('action.save') }}</Button>
        </template>
        <template v-else>
          <Button variant="ghost" @click="optionDialogOpen = false">{{ $t('common.cancel') }}</Button>
          <Button @click="onOptionSubmit">{{ $t('action.save') }}</Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
