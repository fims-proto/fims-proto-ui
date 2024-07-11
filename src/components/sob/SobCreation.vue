<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { SobService, type NewSob } from '../../domain'
import { useSobStore } from '../../store/sob'
import type { FormRules } from '../reusable/form'
import BaseFormItem from '../reusable/form/BaseFormItem.vue'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()

const { year, month } = getCurrentUTCTime()

const newSob = ref<NewSob>({
  name: '',
  description: undefined,
  baseCurrency: 'CNY',
  startingPeriodYear: year,
  startingPeriodMonth: month,
  accountsCodeLength: [4, 2, 2],
})
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

const codeLengthItemRef = ref<InstanceType<typeof BaseFormItem>>()

const onSubmit = async () => {
  const { data, exception } = await SobService.createSob(newSob.value)
  if (exception) {
    return
  }

  sobStore.action.refreshSobs()

  router.replace({
    name: 'sobDetail',
    params: { sobId: data?.id },
  })
}

const onLengthChange = (direction: '+' | '-') => {
  direction === '+' ? newSob.value.accountsCodeLength.push(2) : newSob.value.accountsCodeLength.pop()
  codeLengthItemRef.value?.validate()
}
</script>

<script lang="ts">
function getCurrentUTCTime() {
  const current = new Date()
  return {
    year: current.getUTCFullYear(),
    month: current.getUTCMonth() + 1,
  }
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('sob.creation.title') }}</template>
    <div>
      <BaseForm class="w-full max-w-2xl flex flex-col gap-4" :model="newSob" :rules="formRules" @submit="onSubmit">
        <BaseFormItem :label="t('sob.name')" path="name" required>
          <BaseInput v-model="newSob.name" required />
        </BaseFormItem>

        <BaseFormItem :label="t('common.description')" path="description">
          <BaseInput v-model="newSob.description" />
        </BaseFormItem>

        <BaseFormItem :label="t('sob.baseCurrency')" path="baseCurrency" required>
          <BaseInput v-model="newSob.baseCurrency" />
        </BaseFormItem>

        <BaseFormItem :label="t('sob.startingPeriod')" required>
          <BaseInputGroup>
            <BaseInput
              v-model="newSob.startingPeriodYear"
              html-type="number"
              required
              :force-integer="true"
              :min="2020"
              :max="3000"
              :suffix="t('common.year')"
            />
            <BaseInput
              v-model="newSob.startingPeriodMonth"
              html-type="number"
              required
              :force-integer="true"
              :min="1"
              :max="12"
              :suffix="t('common.month')"
            />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem ref="codeLengthItemRef" :label="t('sob.accountCodeLength')" path="accountsCodeLength" required>
          <div class="flex gap-2">
            <BaseInputGroup>
              <BaseInput
                v-for="(_, index) in newSob.accountsCodeLength"
                :key="`sobCreation-accountsCodeLength-${index}`"
                v-model="newSob.accountsCodeLength[index]"
                class="w-14"
                html-type="number"
                required
                :force-integer="true"
                :min="1"
                :max="6"
              />
            </BaseInputGroup>

            <BaseButtonGroup>
              <BaseButton @click="onLengthChange('-')">-</BaseButton>
              <BaseButton @click="onLengthChange('+')">+</BaseButton>
            </BaseButtonGroup>
          </div>
        </BaseFormItem>

        <BaseButton html-type="submit" category="primary" class="w-full">{{ t('action.submit') }}</BaseButton>
      </BaseForm>
    </div>
  </BasePage>
</template>
