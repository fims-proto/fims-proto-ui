<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSobStore } from '@store/sob'
import { SobService, type Sob } from '@domain/sob'
import { Grid, GridItem } from '../reusable/grid'
import { ObjectPage, type ActionItem } from '../reusable/object-page'
import { type FormItemState, type FormRules } from '../reusable/form'
import { AppForm, AppLabel } from '../reusable/form'
import AccountList from './AccountList.vue'
import AuxiliaryMain from './AuxiliaryMain.vue'

const props = defineProps<{
  sobId?: string
}>()

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
const editMode = ref<'create' | 'update' | 'display'>('display')
const sobActions = computed((): ActionItem[] => [
  {
    label: t('action.edit'),
    condition: () => editMode.value === 'display',
    command: () => (editMode.value = 'update'),
  },
  {
    label: t('action.save'),
    condition: () => editMode.value != 'display',
    command: onSubmit,
  },
  {
    label: t('action.cancel'),
    condition: () => editMode.value != 'display',
    command: onCancel,
  },
])

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
    editMode.value = 'display'
  } else {
    sob.value = EMPTY_SOB
    editMode.value = 'create'
  }
}

watch(() => props.sobId, refreshSob, { immediate: true })

function onLengthChange(direction: '+' | '-') {
  if (direction === '+' && sob.value.accountsCodeLength.length < 10) {
    sob.value.accountsCodeLength.push(2)
  }
  if (direction === '-' && sob.value.accountsCodeLength.length > 2) {
    sob.value.accountsCodeLength.pop()
  }
}

async function onSubmit() {
  if (editMode.value === 'create') {
    const { data, exception } = await SobService.createSob(sob.value)
    if (exception) {
      return
    }

    sobStore.action.refreshSobs()

    router.replace({
      name: 'sobDetail',
      params: { sobId: data?.id },
    })
  } else if (editMode.value === 'update') {
    editMode.value = 'display'
  }
}

async function onCancel() {
  editMode.value = 'display'
}
</script>

<template>
  <ObjectPage
    :title="sob.name || t('sob.creation.title')"
    :actions="sobActions"
    @close="router.push({ name: 'sobMain' })"
  >
    <template #attributes>
      <!-- display mode -->
      <Grid v-if="editMode === 'display'">
        <GridItem :label="t('sob.name')">{{ sob.name }}</GridItem>
        <GridItem :label="t('common.description')">{{ sob.description }}</GridItem>
        <GridItem :label="t('sob.baseCurrency')">{{ sob.baseCurrency }}</GridItem>
        <GridItem :label="t('sob.startingPeriod')">{{ sob.startingPeriodYear }}-{{ sob.startingPeriodMonth }}</GridItem>
        <GridItem :label="t('sob.accountCodeLength')">{{ sob.accountsCodeLength.join('-') }}</GridItem>
      </Grid>

      <!-- edit mode -->
      <AppForm
        v-else
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
        <InputText
          id="sob-description-input"
          v-model="sob.description"
          :disabled="editMode === 'update'"
          class="w-full"
        />

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
    </template>

    <template v-if="sobId" #extra>
      <Tabs value="0" lazy>
        <TabList>
          <Tab value="0">{{ t('sob.detail.accounts') }}</Tab>
          <Tab value="1">{{ t('sob.detail.auxiliaries') }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <AccountList :sob-id="sobId" />
          </TabPanel>
          <TabPanel value="1">
            <AuxiliaryMain :sob-id="sobId" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </ObjectPage>
</template>
