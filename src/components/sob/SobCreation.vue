<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NewSob, Sob, SobService, LedgerService } from '../../domain'

const t = useI18n().t
const router = useRouter()

const { year, month } = getCurrentUTCTime()

const newSob = ref<NewSob>({
  name: '',
  description: undefined,
  baseCurrency: 'CNY',
  startingPeriodYear: year,
  startingPeriodMonth: month,
  accountsCodeLength: [4, 3, 3, 3, 3],
})

const onSubmit = async () => {
  const { data, exception } = await SobService.createSob(newSob.value)
  if (exception) {
    return
  }

  const createdSob = data as Sob

  // create period as well
  await LedgerService.createPeriod({
    sobId: createdSob.id,
    financialYear: createdSob.startingPeriodYear,
    number: createdSob.startingPeriodMonth,
  })

  router.replace({
    name: 'sobDetail',
    params: { sobId: createdSob.id },
  })
}

const onExtend = () => newSob.value.accountsCodeLength.push(3)
const onShorten = () => newSob.value.accountsCodeLength.pop()
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
      <BaseForm class="w-full max-w-2xl" @submit="onSubmit">
        <BaseFormItem :label="t('sob.name')" required>
          <BaseInput v-model="newSob.name" required />
        </BaseFormItem>

        <BaseFormItem :label="t('common.description')">
          <BaseInput v-model="newSob.description" />
        </BaseFormItem>

        <BaseFormItem :label="t('sob.baseCurrency')" required>
          <BaseInput v-model="newSob.baseCurrency" />
        </BaseFormItem>

        <BaseFormItem :label="t('sob.startingPeriod')" required>
          <BaseInputGroup>
            <BaseInput
              v-model="newSob.startingPeriodYear"
              html-type="number"
              required
              :min="2020"
              :max="3000"
              :suffix="t('common.year')"
            />
            <BaseInput
              v-model="newSob.startingPeriodMonth"
              html-type="number"
              required
              :min="1"
              :max="12"
              :suffix="t('common.month')"
            />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem :label="t('sob.accountCodeLength')" required>
          <div class="flex gap-2">
            <BaseInputGroup>
              <BaseInput
                v-for="(_, index) in newSob.accountsCodeLength"
                :key="`sobCreation-accountsCodeLength-${index}`"
                v-model="newSob.accountsCodeLength[index]"
                class="w-14"
                html-type="number"
                required
                :min="1"
                :max="6"
              />
            </BaseInputGroup>

            <BaseButtonGroup>
              <BaseButton @click="onShorten">-</BaseButton>
              <BaseButton @click="onExtend">+</BaseButton>
            </BaseButtonGroup>
          </div>
        </BaseFormItem>

        <BaseButton html-type="submit" type="primary" class="w-full">{{ t('action.submit') }}</BaseButton>
      </BaseForm>
    </div>
  </BasePage>
</template>
