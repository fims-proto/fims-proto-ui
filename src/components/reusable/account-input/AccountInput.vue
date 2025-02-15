<script lang="ts">
defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutoCompleteCompleteEvent, DataTablePageEvent } from 'primevue'
import { AccountService, type Account } from '@domain/general-ledger'
import { FilterFactory } from '@domain/filter'
import type { Page } from '@domain/types'

const props = defineProps<{
  sobId: string
  accountId?: string
  onlyLeaves?: boolean
  invalid?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'change', account: Account | undefined): void
}>()

const { t } = useI18n()

const account = ref<Account>()
const inputOptions = ref<Account[]>()
const helpOpen = ref(false)
const tableOptions = ref<Page<Account>>()
const tablePageable = ref({ page: 1, size: 10 })
const classFilter = ref<string>()
const classOptions = ref(['1', '2', '3', '4', '5', '7'])
const tableQuery = ref<string>()
const factory = new FilterFactory<Account>()

watch(() => props.accountId, load, { immediate: true })
watch([tablePageable.value, classFilter, tableQuery], loadHelpTable)

async function load() {
  account.value = undefined
  inputOptions.value = undefined
  if (props.accountId) {
    account.value = (await AccountService.getAccountById(props.sobId, props.accountId)).data
  }
}

async function loadHelpTable() {
  if (!helpOpen.value) {
    return
  }

  const filters = []
  if (props.onlyLeaves) {
    filters.push(factory.eq('isLeaf', 'true'))
  }
  if (tableQuery.value?.trim()) {
    filters.push(factory.or(factory.ctn('accountNumber', tableQuery.value), factory.ctn('title', tableQuery.value)))
  }
  if (classFilter.value) {
    filters.push(factory.eq('class', classFilter.value))
  }

  tableOptions.value = (
    await AccountService.searchAccounts(props.sobId, tablePageable.value, factory.and(...filters))
  ).data
}

function resetTableFilter() {
  tableQuery.value = ''
  classFilter.value = undefined
  tablePageable.value.page = 1
}

async function onSearchAccount(event: AutoCompleteCompleteEvent) {
  let filter = factory.or(factory.ctn('accountNumber', event.query), factory.ctn('title', event.query))
  if (props.onlyLeaves) {
    filter = factory.and(factory.eq('isLeaf', 'true'), filter)
  }

  const { data } = await AccountService.searchAccounts(props.sobId, { page: 1, size: 10 }, filter)
  inputOptions.value = data?.content
}

async function onHelpTableOpen() {
  helpOpen.value = true
  await loadHelpTable()
}

async function onHelpTablePage(page: DataTablePageEvent) {
  tablePageable.value.page = page.page + 1
}

async function onAccountChange() {
  console.log('update:model-value')
  emit('change', account.value)
  helpOpen.value = false
}
</script>

<template>
  <div>
    <InputGroup>
      <AutoComplete
        v-model="account"
        :option-label="(item) => `${item.accountNumber} ${item.title}`"
        :suggestions="inputOptions"
        :invalid="invalid"
        force-selection
        fluid
        @complete="onSearchAccount"
        @update:model-value="onAccountChange"
        @clear="
          () => {
            console.log('clear')
            emit('change', undefined)
          }
        "
      />
      <Button
        icon="pi pi-window-maximize"
        severity="secondary"
        :aria-label="t('action.inputHelp')"
        @click="onHelpTableOpen"
      />
    </InputGroup>
  </div>

  <!-- input help dialog -->
  <Dialog v-model:visible="helpOpen" :header="t('account.selectAccountTitle')" modal @after-hide="resetTableFilter">
    <DataTable
      v-model:selection="account"
      :value="tableOptions?.content"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      paginator
      lazy
      size="small"
      :rows="tablePageable.size"
      :total-records="tableOptions?.numberOfElements"
      @page="onHelpTablePage"
      @update:selection="onAccountChange"
    >
      <template #header>
        <div class="flex flex-wrap gap-2">
          <InputText v-model="tableQuery" type="text" />
          <SelectButton v-model="classFilter" :options="classOptions">
            <template #option="{ option }">
              <span class="text-nowrap">{{ t(`account.classEnum.${option}`) }}</span>
            </template>
          </SelectButton>
        </div>
      </template>
      <Column :header="t('account.accountNumber')" field="accountNumber" />
      <Column :header="t('account.accountTitle')" field="title" />
    </DataTable>
  </Dialog>
</template>
