<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { type FormItemState, type FormRules } from '../reusable/form'
import { AppForm, AppLabel } from '../reusable/form'
import { useSobStore } from '@store/sob'
import { SobService, type Sob } from '@domain/sob'

const props = withDefaults(
  defineProps<{
    sobId?: string
    editMode?: 'create' | 'update' | 'display'
  }>(),
  {
    sobId: undefined,
    editMode: 'display',
  },
)

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()

const { year, month } = (() => ({
  year: new Date().getUTCFullYear(),
  month: new Date().getUTCMonth() + 1,
}))()

const EMPTY_SOB = {
  id: '',
  name: '',
  description: undefined,
  baseCurrency: 'CNY',
  startingPeriodYear: year,
  startingPeriodMonth: month,
  accountsCodeLength: [4, 2, 2],
}

const sob = ref<Sob>(EMPTY_SOB)
const itemState = ref<FormItemState>({})
const formRules: FormRules = {
  name: {
    required: true,
  },
  baseCurrency: {
    required: true,
  },
  accountsCodeLength: {
    required: true,
    validator: (value) => {
      if ((value as Array<number>).length < 2 || (value as Array<number>).length > 10) {
        return Error('sob.error.invalidAccountCodeLength')
      }
      return true
    },
  },
}

const refreshSob = async () => {
  if (props.sobId) {
    sob.value = (await SobService.getSobById(props.sobId)).data ?? EMPTY_SOB
  } else {
    sob.value = EMPTY_SOB
  }
}

watch(() => props.sobId, refreshSob, { immediate: true })

const onLengthChange = (direction: '+' | '-') => {
  if (direction === '+' && sob.value.accountsCodeLength.length < 10) {
    sob.value.accountsCodeLength.push(2)
  }
  if (direction === '-' && sob.value.accountsCodeLength.length > 2) {
    sob.value.accountsCodeLength.pop()
  }
}

const onSubmit = async () => {
  if (props.editMode === 'create') {
    const { data, exception } = await SobService.createSob(sob.value)
    if (exception) {
      return
    }

    sobStore.action.refreshSobs()

    router.replace({
      name: 'sobDetail',
      params: { sobId: data?.id },
    })
  }
}
</script>

<template>
  <AppForm
    v-if="editMode !== 'display'"
    :model="sob"
    :rules="formRules"
    class="flex flex-col"
    @submit="onSubmit"
    @item-state-change="(newState: FormItemState) => (itemState = newState)"
  >
    <AppLabel required for="sob-name-input">{{ t('sob.name') }}</AppLabel>
    <InputText
      id="sob-name-input"
      v-model="sob.name"
      :invalid="itemState['name']?.invalid"
      aria-describedby="sob-name-help"
      class="w-full"
    />
    <small v-if="itemState['name']?.message" id="sob-name-help">
      {{ t(itemState['name'].message) }}
    </small>

    <AppLabel for="sob-description-input">{{ t('common.description') }}</AppLabel>
    <InputText id="sob-description-input" v-model="sob.description" :disabled="editMode === 'update'" class="w-full" />

    <AppLabel required for="sob-currency-input">{{ t('sob.baseCurrency') }}</AppLabel>
    <InputText
      id="sob-currency-input"
      v-model="sob.baseCurrency"
      :invalid="itemState['sob.baseCurrency']?.invalid"
      :disabled="editMode === 'update'"
      aria-describedby="sob-currency-help"
      class="w-full"
    />
    <small v-if="itemState['baseCurrency']?.message" id="sob-currency-help">
      {{ t(itemState['baseCurrency'].message) }}
    </small>

    <AppLabel required>{{ t('sob.startingPeriod') }}</AppLabel>
    <InputGroup>
      <InputGroupAddon>{{ t('common.year') }}</InputGroupAddon>
      <InputNumber
        v-model="sob.startingPeriodYear"
        input-id="sob-year"
        :min="2020"
        :max="3000"
        :use-grouping="false"
        :disabled="editMode === 'update'"
        fluid
      />
      <InputGroupAddon>{{ t('common.month') }}</InputGroupAddon>
      <InputNumber
        v-model="sob.startingPeriodMonth"
        input-id="sob-month"
        :min="1"
        :max="12"
        :disabled="editMode === 'update'"
        fluid
      />
    </InputGroup>

    <AppLabel required>{{ t('sob.accountCodeLength') }}</AppLabel>
    <InputGroup>
      <Button icon="pi pi-minus" @click="onLengthChange('-')" />
      <Button icon="pi pi-plus" @click="onLengthChange('+')" />
      <InputNumber
        v-for="(_, index) in sob.accountsCodeLength"
        :key="`sob-new-accounts-code-length-${index}`"
        v-model="sob.accountsCodeLength[index]"
        :input-id="`sob-new-accounts-code-length-${index}`"
        :min="1"
        :max="6"
      />
    </InputGroup>

    <Button v-if="editMode === 'create'" :label="t('action.submit')" type="submit" />
  </AppForm>

  <div v-else class="flex flex-col gap-4">
    <div class="flex gap-2">
      <span>{{ t('sob.name') }}:</span>
      <span>{{ sob.name }}</span>
    </div>

    <div class="flex gap-2">
      <span>{{ t('common.description') }}:</span>
      <span>{{ sob.description }}</span>
    </div>

    <div class="flex gap-2">
      <span>{{ t('sob.baseCurrency') }}:</span>
      <span>{{ sob.baseCurrency }}</span>
    </div>

    <div class="flex gap-2">
      <span>{{ t('sob.startingPeriod') }}:</span>
      <span>{{ sob.startingPeriodYear }}-{{ sob.startingPeriodMonth }}</span>
    </div>

    <div class="flex gap-2">
      <span>{{ t('sob.accountCodeLength') }}:</span>
      <span>{{ sob.accountsCodeLength.join('-') }}</span>
    </div>
  </div>
</template>
