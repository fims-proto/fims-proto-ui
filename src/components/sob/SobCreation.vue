<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { LedgerService, NewSob, SobService } from '../../domain';
import { useSobStore } from '../../store/sob';

export default defineComponent({
  setup() {
    const t = useI18n().t
    const router = useRouter()
    const sobStore = useSobStore()

    const { year, month } = getCurrentUTCTime()

    const newSob = ref<NewSob>({
      name: "",
      description: undefined,
      baseCurrency: "CNY",
      startingPeriodYear: year,
      startingPeriodMonth: month,
      accountsCodeLength: [4, 3, 3]
    })

    const handleSubmit = async () => {
      // parse number
      newSob.value.startingPeriodYear = Number(newSob.value.startingPeriodYear)
      newSob.value.startingPeriodMonth = Number(newSob.value.startingPeriodMonth)
      for (const i in newSob.value.accountsCodeLength) {
        newSob.value.accountsCodeLength[i] = Number(newSob.value.accountsCodeLength[i])
      }
      const createdSob = await SobService.createSob(newSob.value)

      // create accounting period as well
      await LedgerService.createPeriod({
        sobId: createdSob.id,
        financialYear: createdSob.startingPeriodYear,
        number: createdSob.startingPeriodMonth
      })

      sobStore.action.refreshSobs()
      router.replace({
        name: 'sobDetail',
        params: { sobId: createdSob.id }
      })
    }

    return {
      t,
      newSob,
      handleExtend() {
        newSob.value.accountsCodeLength.push(2)
      },
      handleShorten() {
        newSob.value.accountsCodeLength.pop()
      },
      handleSubmit
    }
  }
})

function getCurrentUTCTime() {
  const current = new Date()
  return {
    year: current.getUTCFullYear(),
    month: current.getUTCMonth() + 1
  }
}

</script>

<template>
  <base-page>
    <template #title>{{ t('sob.creation.title') }}</template>
    <div>
      <base-form class="w-full max-w-2xl" @submit="handleSubmit">
        <base-input :label="t('sob.name')" v-model="newSob.name" required />
        <base-input :label="t('common.description')" v-model="newSob.description" />
        <base-input :label="t('sob.baseCurrency')" v-model="newSob.baseCurrency" required />

        <base-input-group :label="t('sob.startingPeriod')" required>
          <base-input :label="t('common.year')" hide-label v-model="newSob.startingPeriodYear" type="number" required
            :min="2020" :max="3000" :suffix="t('common.year')" />
          <base-input :label="t('common.month')" hide-label v-model="newSob.startingPeriodMonth" type="number" required
            :min="1" :max="12" :suffix="t('common.month')" />
        </base-input-group>

        <base-input-group :label="t('sob.accountCodeLength')" required>
          <base-input v-for="_, index in newSob.accountsCodeLength" :key="`sobCreation-accountsCodeLength-${index}`"
            class="w-14" :label="`${t('sob.accountCodeLength')}_${index}`" hide-label
            v-model="newSob.accountsCodeLength[index]" type="number" required :min="1" :max="6" />
          <template #suffix>
            <base-button-group>
              <base-button @click="handleShorten">-</base-button>
              <base-button @click="handleExtend">+</base-button>
            </base-button-group>
          </template>
        </base-input-group>

        <base-button type="submit" categoty="primary" class="w-full">{{ t('action.submit') }}</base-button>
      </base-form>
    </div>
  </base-page>
</template>