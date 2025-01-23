<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { type FormInstance } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useSobStore } from '@store/sob'
import { SobService, type Sob } from '@domain/sob'
import { Grid, GridItem } from '../reusable/grid'
import { ObjectPage, type ActionItem } from '../reusable/object-page'
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
const formRef = useTemplateRef<FormInstance>('form')
const sobActions = computed((): ActionItem[] => [
  {
    label: t('sob.detail.initialize'),
    condition: () => editMode.value === 'display' && !!props.sobId,
    command: () => router.push({ name: 'ledgerInitialize', params: { sobId: props.sobId } }),
  },
  {
    label: t('action.edit'),
    condition: () => editMode.value === 'display',
    command: () => (editMode.value = 'update'),
  },
  {
    label: t('action.save'),
    condition: () => editMode.value != 'display',
    command: () => formRef.value?.submit(),
  },
  {
    label: t('action.cancel'),
    condition: () => editMode.value != 'display',
    command: onCancel,
  },
])

const resolver = ref(
  zodResolver(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      baseCurrency: z.string(),
      startingPeriodYear: z.number(),
      startingPeriodMonth: z.number(),
      accountsCodeLength: z.array(z.number()).min(2).max(10),
    }),
  ),
)

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

function onLengthChange(direction: '+' | '-', arr: number[]) {
  if (direction === '+' && arr.length < 10) {
    arr.push(2)
  }
  if (direction === '-' && arr.length > 2) {
    arr.pop()
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
      <Form v-else ref="form" :resolver :initial-values="sob" @submit="onSubmit">
        <Grid>
          <FormField v-slot="$field" as-child name="name">
            <GridItem :label="t('sob.name')" required pt:label:for="sob-name-input">
              <InputText id="sob-name-input" aria-describedby="sob-name-help" />
              <Message v-if="$field?.invalid" id="sob-name-help" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </GridItem>
          </FormField>

          <FormField as-child name="description">
            <GridItem :label="t('common.description')" pt:label:for="sob-description-input">
              <InputText id="sob-description-input" :disabled="editMode === 'update'" />
            </GridItem>
          </FormField>

          <FormField v-slot="$field" as-child name="baseCurrency">
            <GridItem :label="t('sob.baseCurrency')" required pt:label:for="sob-currency-input">
              <InputText
                id="sob-currency-input"
                aria-describedby="sob-currency-help"
                :disabled="editMode === 'update'"
              />
              <Message v-if="$field?.invalid" id="sob-currency-help" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </GridItem>
          </FormField>

          <GridItem :label="t('sob.startingPeriod')" required>
            <InputGroup>
              <InputGroupAddon>
                <span class="text-sm">{{ t('common.year') }}</span>
              </InputGroupAddon>
              <InputNumber
                name="startingPeriodYear"
                :min="2020"
                :max="3000"
                :use-grouping="false"
                :disabled="editMode === 'update'"
              />
              <InputGroupAddon>
                <span class="text-sm">{{ t('common.month') }}</span>
              </InputGroupAddon>
              <InputNumber name="startingPeriodMonth" :min="1" :max="12" :disabled="editMode === 'update'" />
            </InputGroup>
          </GridItem>

          <FormField v-slot="$field" as-child name="accountsCodeLength">
            <GridItem :label="t('sob.accountCodeLength')" required>
              <InputGroup>
                <Button icon="pi pi-minus" @click="onLengthChange('-', $field.value)" />
                <Button icon="pi pi-plus" @click="onLengthChange('+', $field.value)" />
                <InputNumber
                  v-for="(_, index) in $field.value"
                  :key="`sob-accounts-code-length-${index}`"
                  v-model="$field.value[index]"
                  :input-id="`sob-accounts-code-length-${index}`"
                  :min="1"
                  :max="6"
                />
              </InputGroup>
            </GridItem>
          </FormField>
        </Grid>
      </Form>
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
