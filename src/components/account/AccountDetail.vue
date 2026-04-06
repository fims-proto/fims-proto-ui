<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventBus } from '@vueuse/core'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import { z } from 'zod'

import { PageFrame } from '@/components/common/page'
import { EditableField } from '@/components/common/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { Check, PlusCircle, X } from 'lucide-vue-next'
import AccountInput from './AccountInput.vue'

import { cn } from '@/lib/utils'

import {
  AccountDetailSchema,
  CreateAccountSchema,
  AccountService,
  usePadLevelNumber,
  type AccountClass,
} from '@/services/general-ledger'
import { DimensionService, type DimensionCategory } from '@/services/dimension'
import { useSobStore } from '@/store/sob'
import { useToastStore } from '@/store/toast'
import { useUnsavedChanges, UnsavedChangesDialog } from '@/components/common/unsaved-guard'
import { ConfirmationButton } from '@/components/common/confirmation'
import { ACCOUNT_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
  accountId?: string
}>()

const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()
const sobStore = useSobStore()
const bus = useEventBus(ACCOUNT_CHANGED)
const workingSob = computed(() => sobStore.state.workingSob)

// Create form schema with validation that captures accountCodeLength at creation time
function createFormSchema(accountCodeLength: readonly number[]) {
  return CreateAccountSchema.extend({
    superiorAccount: AccountDetailSchema.optional(),
  }).superRefine((data, ctx) => {
    const currentLevel = (data.superiorAccount?.level ?? 0) + 1
    const maxDigits = accountCodeLength[currentLevel - 1]

    if (!maxDigits) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['levelNumber'],
        message: t('account.msg.invalidLevel'),
      })
      return
    }

    const maxValue = Math.pow(10, maxDigits) - 1

    if (data.levelNumber < 1 || data.levelNumber > maxValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['levelNumber'],
        message: t('account.msg.levelNumberOutOfRange', [maxValue]),
      })
    }
  })
}

const formSchema = ref(toTypedSchema(createFormSchema(workingSob.value?.accountsCodeLength ?? [])))

const isEditing = ref(!props.accountId) // true for create, false for view existing
const classGroupsMap = ref<Record<string, string[]>>({})
const dimensionCategories = ref<DimensionCategory[]>([])
const dimensionCategoriesPopoverOpen = ref(false)

const EMPTY_ACCOUNT = {
  title: '',
  levelNumber: 1,
  class: '1',
  group: '101',
  balanceDirection: 'debit' as const,
  dimensionCategoryIds: [],
}

const form = useForm({
  validationSchema: formSchema,
})

const level = computed(() => (form.values.superiorAccount?.level ?? 0) + 1)
const paddedLevelNumber = usePadLevelNumber(
  () => form.values.levelNumber ?? 0,
  () => level.value,
)

const accountNumberPreview = computed(() => {
  const superior = form.values.superiorAccount?.accountNumber ?? ''
  const padded = paddedLevelNumber.value ?? ''
  return superior + padded
})

const groupOptions = computed(() => {
  const classValue = form.values.class
  return classValue ? (classGroupsMap.value[classValue] ?? []) : []
})

const selectedCategoryIds = computed(() => new Set(form.values.dimensionCategoryIds ?? []))

const selectedCategories = computed(() => {
  const ids = form.values.dimensionCategoryIds ?? []
  return dimensionCategories.value.filter((cat) => ids.includes(cat.id))
})

const formatClassLabel = (value?: string) => (value ? t(`account.classEnum.${value}`) : '')
const formatGroupLabel = (value?: string) => (value ? t(`account.groupEnum.${value}`) : '')
const formatBalanceDirectionLabel = (value?: string) => (value ? t(`account.balanceDirectionEnum.${value}`) : '')

// Computed validation constraints for levelNumber based on current level
const levelNumberConstraints = computed(() => {
  const accountCodeLength = workingSob.value?.accountsCodeLength ?? []
  const currentLevel = level.value
  const maxDigits = accountCodeLength[currentLevel]

  if (!maxDigits) {
    return { min: 1, max: 1, valid: false }
  }

  const maxValue = Math.pow(10, maxDigits) - 1
  return { min: 1, max: maxValue, valid: true }
})

watch(() => props.accountId, load, { immediate: true })

// Watch class changes to clear invalid group selections
watch(
  () => form.values.class,
  (newClass, oldClass) => {
    if (isEditing.value && newClass !== oldClass && newClass) {
      const validGroups = classGroupsMap.value[newClass] ?? []
      form.setFieldValue('group', validGroups[0] ?? '')
    }
  },
)

const { confirmOpen, onConfirmLeave, onCancelLeave } = useUnsavedChanges(computed(() => form.meta.value.dirty))

async function loadAccountClasses() {
  const { data } = await AccountService.getClasses(props.sobId)
  if (data) {
    const map: Record<string, string[]> = {}
    data.forEach((accountClass: AccountClass) => {
      map[accountClass.id] = accountClass.groups
    })
    classGroupsMap.value = map
  }
}

async function loadDimensionCategories() {
  const { data } = await DimensionService.getDimensionCategories(props.sobId, { page: 1, size: 100 })
  if (data) {
    dimensionCategories.value = data.content
  }
}

async function load() {
  await loadAccountClasses()
  await loadDimensionCategories()

  if (props.accountId) {
    isEditing.value = false
    const { data } = await AccountService.getAccountById(props.sobId, props.accountId)
    if (data) {
      // Transform Account to form values with superiorAccount object if exists
      const formValues = {
        title: data.title,
        levelNumber: 1, // Placeholder, computed after loading superior account
        class: data.class,
        group: data.group,
        balanceDirection: data.balanceDirection,
        dimensionCategoryIds: data.dimensionCategories?.map((c) => c.id) ?? [],
        superiorAccount: undefined as typeof data | undefined,
      }

      // Load superior account if exists
      if (data.superiorAccountId) {
        const { data: superiorAccount } = await AccountService.getAccountById(props.sobId, data.superiorAccountId)
        if (superiorAccount) {
          formValues.superiorAccount = superiorAccount
        }
      }

      // Derive levelNumber from accountNumber suffix after superior's accountNumber
      const superiorAccountNumber = formValues.superiorAccount?.accountNumber ?? ''
      formValues.levelNumber = parseInt(data.accountNumber.slice(superiorAccountNumber.length), 10) || 1

      form.resetForm({ values: formValues }, { force: true })
    }
  } else {
    isEditing.value = true
    form.resetForm({ values: EMPTY_ACCOUNT }, { force: true })
  }
}

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  // Transform superiorAccount to superiorAccountNumber
  if (values.superiorAccount) {
    values.superiorAccountNumber = values.superiorAccount.accountNumber
  }

  let data
  let exception

  if (props.accountId) {
    // Update existing account
    ;({ exception } = await AccountService.updateAccount(props.sobId, props.accountId, values))
  } else {
    // Create new account
    ;({ data, exception } = await AccountService.createAccount(props.sobId, values))
  }

  if (exception) {
    return
  }

  resetForm({ values })
  toast.action.success(t('account.msg.saveSuccess'))
  bus.emit()

  if (!props.accountId && data) {
    // Navigate to detail page after creation
    router.push({ name: 'accountDetail', params: { sobId: props.sobId, accountId: data.id } })
    return
  }

  if (props.accountId) {
    // Switch back to view mode after update
    isEditing.value = false
  }
})

function onCancel() {
  if (!props.accountId) {
    // Create mode: go back in history
    router.back()
  } else {
    // Edit mode: switch to view mode
    isEditing.value = false
    // Reload the data to discard changes
    load()
  }
}

function onEdit() {
  isEditing.value = true
}

function onClose() {
  router.push({ name: 'accountList', params: { sobId: props.sobId } })
}

async function onDelete() {
  if (!props.accountId) return
  const { exception } = await AccountService.deleteAccount(props.sobId, props.accountId)
  if (exception) return
  toast.action.success(t('account.msg.deleteSuccess'))
  bus.emit()
  router.push({ name: 'accountList', params: { sobId: props.sobId } })
}

function toggleCategorySelection(categoryId: string, update: (value: string[]) => void) {
  const currentIds = form.values.dimensionCategoryIds ?? []
  const isSelected = currentIds.includes(categoryId)
  const nextIds = isSelected ? currentIds.filter((id) => id !== categoryId) : [...currentIds, categoryId]

  update(nextIds)
}
</script>

<template>
  <PageFrame
    :secondary-title="props.accountId ? $t('action.detail') : $t('action.create')"
    :dirty-indicator="form.meta.value.dirty"
  >
    <template #end>
      <!-- Display mode: Edit + Close -->
      <template v-if="!isEditing && props.accountId">
        <ConfirmationButton
          variant="destructive"
          :message="$t('account.msg.confirmDelete')"
          @confirm="onDelete"
        >
          {{ $t('action.delete') }}
        </ConfirmationButton>
        <Button variant="outline" @click="onEdit">{{ $t('action.edit') }}</Button>
        <Button variant="ghost" @click="onClose">{{ $t('action.close') }}</Button>
      </template>
      <!-- Edit/Create mode: Save + Cancel -->
      <template v-if="isEditing">
        <Button @click="onSubmit">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="onCancel">{{ $t('action.cancel') }}</Button>
      </template>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <VeeField v-slot="{ field, errors }" name="title">
        <EditableField
          :label="$t('account.accountTitle')"
          label-for="title"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <Input
              id="title"
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

      <VeeField v-slot="{ field, errors }" name="superiorAccount">
        <EditableField
          :label="$t('account.superiorAccount')"
          label-for="superiorAccount"
          :formatter="(val) => (val ? `${val.accountNumber} ${val.title}` : '')"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <AccountInput
              id="superiorAccount"
              :disabled="!!props.accountId"
              :placeholder="$t('account.noSuperiorAccount')"
              :model-value="value"
              :aria-invalid="!!errors.length"
              @update:model-value="onUpdate"
            />
          </template>
        </EditableField>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="levelNumber">
        <EditableField
          :label="$t('account.levelNumber')"
          label-for="levelNumber"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          :description="`${$t('account.accountNumberPreview')}: ${accountNumberPreview}`"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <Input
              id="levelNumber"
              type="number"
              :min="levelNumberConstraints.min"
              :max="levelNumberConstraints.max"
              :disabled="!isEditing"
              :model-value="value"
              :name="field.name"
              @update:model-value="onUpdate"
              @blur="field.onBlur"
            />
          </template>
        </EditableField>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="class">
        <EditableField
          :label="$t('account.class')"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          :formatter="formatClassLabel"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <ToggleGroup
              variant="outline"
              type="single"
              :disabled="!!props.accountId"
              :model-value="value"
              class="justify-start"
              :aria-label="$t('account.class')"
              @update:model-value="(v) => onUpdate(v as string | undefined)"
            >
              <ToggleGroupItem v-for="classValue in Object.keys(classGroupsMap)" :key="classValue" :value="classValue">
                {{ $t(`account.classEnum.${classValue}`) }}
              </ToggleGroupItem>
            </ToggleGroup>
          </template>
        </EditableField>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="group">
        <EditableField
          :label="$t('account.group')"
          label-for="group"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          :formatter="formatGroupLabel"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <Select
              :name="field.name"
              :disabled="!isEditing || groupOptions.length === 0"
              :model-value="value"
              @update:model-value="(v) => onUpdate(v as string | undefined)"
            >
              <SelectTrigger id="group" :aria-invalid="!!errors.length">
                <SelectValue :placeholder="$t('common.pleaseSelect')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="group in groupOptions" :key="group" :value="group">
                  {{ $t(`account.groupEnum.${group}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </EditableField>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="balanceDirection">
        <EditableField
          :label="$t('account.balanceDirection')"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          :formatter="formatBalanceDirectionLabel"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <ToggleGroup
              variant="outline"
              type="single"
              :disabled="!isEditing"
              :model-value="value"
              class="justify-start"
              :aria-label="$t('account.balanceDirection')"
              @update:model-value="(v) => onUpdate(v as string | undefined)"
            >
              <ToggleGroupItem value="debit">
                {{ $t('account.balanceDirectionEnum.debit') }}
              </ToggleGroupItem>
              <ToggleGroupItem value="credit">
                {{ $t('account.balanceDirectionEnum.credit') }}
              </ToggleGroupItem>
            </ToggleGroup>
          </template>
        </EditableField>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="dimensionCategoryIds">
        <EditableField
          :label="$t('account.dimension.category')"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #display>
            <div v-if="selectedCategories.length > 0" class="flex flex-wrap gap-2">
              <Badge
                v-for="category in selectedCategories"
                :key="category.id"
                variant="secondary"
                class="cursor-default"
              >
                <span>{{ category.name }}</span>
              </Badge>
            </div>
            <div v-else class="text-muted-foreground text-sm">
              {{ $t('account.dimension.noDimensionCategories') }}
            </div>
          </template>

          <template #edit="{ onUpdate }">
            <Popover v-model:open="dimensionCategoriesPopoverOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm" class="h-9 w-full justify-start border-dashed">
                  <PlusCircle class="mr-2 h-4 w-4" />
                  {{ $t('account.dimension.selectDimensionCategories') }}
                  <template v-if="selectedCategoryIds.size > 0">
                    <Separator orientation="vertical" class="mx-2 h-4" />
                    <Badge variant="secondary" class="rounded-sm px-1 font-normal">
                      {{ selectedCategoryIds.size }}
                    </Badge>
                  </template>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-75 p-0" align="start">
                <Command>
                  <CommandInput :placeholder="$t('account.dimension.category')" />
                  <CommandList>
                    <template v-if="dimensionCategories.length > 0">
                      <CommandEmpty>{{ $t('common.noResults') }}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="category in dimensionCategories"
                          :key="category.id"
                          :value="category"
                          @select="() => toggleCategorySelection(category.id, onUpdate)"
                        >
                          <div
                            :class="
                              cn(
                                'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                selectedCategoryIds.has(category.id)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible',
                              )
                            "
                          >
                            <Check :class="cn('h-4 w-4')" />
                          </div>
                          <span>{{ category.name }}</span>
                        </CommandItem>
                      </CommandGroup>
                    </template>
                    <div v-else class="py-6 text-center text-sm">
                      {{ $t('common.noData') }}
                    </div>

                    <template v-if="selectedCategoryIds.size > 0">
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          :value="{ label: 'Clear selection' }"
                          class="justify-center text-center"
                          @select="onUpdate([])"
                        >
                          {{ $t('common.cancel') }}
                        </CommandItem>
                      </CommandGroup>
                    </template>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div v-if="selectedCategories.length > 0" class="mt-2 flex flex-wrap gap-2">
              <Badge
                v-for="category in selectedCategories"
                :key="category.id"
                variant="secondary"
                class="group flex items-center gap-1 pr-1"
              >
                <span>{{ category.name }}</span>
                <button
                  type="button"
                  class="focus:ring-ring ml-1 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  @click.stop="toggleCategorySelection(category.id, onUpdate)"
                >
                  <X class="h-3 w-3" />
                  <span class="sr-only">{{ $t('action.delete') }}</span>
                </button>
              </Badge>
            </div>
          </template>
        </EditableField>
      </VeeField>
    </form>
  </PageFrame>

  <UnsavedChangesDialog :open="confirmOpen" @confirm="onConfirmLeave" @cancel="onCancelLeave" />
</template>
