<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NewSob, SobService, LedgerService } from '../../domain'
import { useSobStore } from '../../store/sob'

const t = useI18n().t
const router = useRouter()
const sobStore = useSobStore()

const { year, month } = getCurrentUTCTime()

const newSob = ref<NewSob>({
  name: '',
  description: undefined,
  baseCurrency: 'CNY',
  startingPeriodYear: year,
  startingPeriodMonth: month,
  accountsCodeLength: [4, 3, 3],
})

const handleSubmit = async () => {
  const createdSob = await SobService.createSob(newSob.value)

  // create accounting period as well
  await LedgerService.createPeriod({
    sobId: createdSob.id,
    financialYear: createdSob.startingPeriodYear,
    number: createdSob.startingPeriodMonth,
  })

  sobStore.action.refreshSobs()
  router.replace({
    name: 'sobDetail',
    params: { sobId: createdSob.id },
  })
}

const onExtend = () => newSob.value.accountsCodeLength.push(2)
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
  <base-page>
    <template #title>{{ t('sob.creation.title') }}</template>
    <div>
      <base-form class="w-full max-w-2xl" @submit="handleSubmit">
        <base-form-item :label="t('sob.name')" required>
          <base-input v-model="newSob.name" required />
        </base-form-item>

        <base-form-item :label="t('common.description')">
          <base-input v-model="newSob.description" />
        </base-form-item>

        <base-form-item :label="t('sob.baseCurrency')" required>
          <base-input v-model="newSob.baseCurrency" />
        </base-form-item>

        <base-form-item :label="t('sob.startingPeriod')" required>
          <base-input-group>
            <base-input
              v-model="newSob.startingPeriodYear"
              html-type="number"
              required
              :min="2020"
              :max="3000"
              :suffix="t('common.year')"
            />
            <base-input
              v-model="newSob.startingPeriodMonth"
              html-type="number"
              required
              :min="1"
              :max="12"
              :suffix="t('common.month')"
            />
          </base-input-group>
        </base-form-item>

        <base-form-item :label="t('sob.accountCodeLength')" required>
          <div class="flex gap-2">
            <base-input-group>
              <base-input
                v-for="(_, index) in newSob.accountsCodeLength"
                :key="`sobCreation-accountsCodeLength-${index}`"
                v-model="newSob.accountsCodeLength[index]"
                class="w-14"
                html-type="number"
                required
                :min="1"
                :max="6"
              />
            </base-input-group>

            <base-button-group>
              <base-button @click="onShorten">-</base-button>
              <base-button @click="onExtend">+</base-button>
            </base-button-group>
          </div>
        </base-form-item>

        <base-button html-type="submit" type="primary" class="w-full">{{ t('action.submit') }}</base-button>
      </base-form>
    </div>
  </base-page>
</template>
