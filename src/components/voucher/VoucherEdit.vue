<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccountInputAccount, AccountInputAuxiliaryAccount, VoucherForm, VoucherFormLineItem } from './types'
import { AppLabel } from '../reusable/form'
import { useRouter } from 'vue-router'
import { injectContext } from './context'
import { AccountInput } from '../reusable/account-input'
import { useUserStore } from '@store/user'
import { useToastStore } from '@store/toast'
import {
  AccountService,
  VoucherService,
  type Account,
  type LineItemRequest,
  type Voucher,
} from '@domain/general-ledger'
import { ObjectPage, type ActionItem } from '../reusable/object-page'
import { confirm } from '../reusable/confirm-button'
import { GridContainer, GridItem } from '../reusable/grid'

const props = defineProps<{
  sobId: string
  voucherId?: string
}>()

const { t, n, d } = useI18n()
const { user } = useUserStore().state
const toast = useToastStore()
const router = useRouter()
const context = injectContext()

const editMode = ref(false)
const auxiliaryAccountOptions = ref<{ [key: string]: AccountInputAuxiliaryAccount[] }>({})

const emptyLineItem = (): VoucherFormLineItem => ({ text: '', debit: 0, credit: 0 })
const emptyVoucher = (): VoucherForm => ({
  headerText: '',
  transactionTime: new Date(),
  attachmentQuantity: 0,
  voucherType: 'general_voucher',
  creator: { id: user.id, traits: user.traits },
  lineItems: Array.from({ length: 4 }, () => emptyLineItem()),
})

const voucher = ref<Voucher>()
const voucherForm = ref<VoucherForm>(emptyVoucher())
const voucherActions = computed((): ActionItem[] => [
  {
    label: t('action.edit'),
    condition: () => !!props.voucherId && !editMode.value,
    command: () => (editMode.value = true),
  },
  {
    label: t('action.saveAndNew'),
    condition: () => editMode.value && !props.voucherId,
    command: () => onSave(false),
  },
  {
    label: t('action.save'),
    condition: () => editMode.value,
    command: () => onSave(true),
  },
  {
    label: t('action.cancel'),
    condition: () => editMode.value,
    command: onCancel,
  },
  {
    label: t('voucher.audit'),
    condition: () => !!props.voucherId && !voucher.value?.isAudited && !editMode.value,
    command: () => onAction('audit'),
  },
  {
    label: t('voucher.cancelAudit'),
    condition: () => !!props.voucherId && voucher.value?.isAudited && !editMode.value,
    command: (e) => confirm(e, { accept: () => onAction('cancelAudit') }),
  },
  {
    label: t('voucher.review'),
    condition: () => !!props.voucherId && !voucher.value?.isReviewed && !editMode.value,
    command: () => onAction('review'),
  },
  {
    label: t('voucher.cancelReview'),
    condition: () => !!props.voucherId && voucher.value?.isReviewed && !editMode.value,
    command: (e) => confirm(e, { accept: () => onAction('cancelReview') }),
  },
  {
    label: t('voucher.post'),
    condition: () =>
      !!props.voucherId && voucher.value?.isReviewed && voucher.value.isAudited && !voucher.value.isPosted,
    command: () => onAction('post'),
  },
])

watch(() => props.voucherId, load, { immediate: true })

async function load() {
  editMode.value = !props.voucherId // if voucherId provided, default display mode
  voucher.value = undefined

  if (props.voucherId) {
    voucher.value = (await VoucherService.getVoucherById(props.sobId, props.voucherId)).data
  }

  if (voucher.value) {
    voucherForm.value = voucher.value
  } else {
    voucherForm.value = emptyVoucher()
  }

  // pre-fill auxiliary account dropdown list
  voucherForm.value.lineItems.forEach((item) => {
    if (item.account) {
      fillAuxiliaryAccountOptions(item.account)
    }
  })
}

async function fillAuxiliaryAccountOptions(account: AccountInputAccount) {
  account.auxiliaryCategories?.forEach(async (category) => {
    const { data } = await AccountService.getAuxiliaryAccounts(props.sobId, category.key, { page: 1, size: 999 })
    if (data) {
      auxiliaryAccountOptions.value[category.key] = data.content
    }
  })
}

function onAddLineItem(index: number) {
  voucherForm.value.lineItems.splice(index, 0, emptyLineItem())
}

function onRemoveLineItem(index: number) {
  voucherForm.value.lineItems.splice(index, 1)
}

async function onAccountSelect(account: Account | undefined, lineItem: VoucherFormLineItem) {
  lineItem.account = account
  if (account) {
    lineItem.auxiliaryAccounts = account.auxiliaryCategories?.map((category) => ({ category }))
    await fillAuxiliaryAccountOptions(account)
  }
}

async function onSave(openCreated?: boolean) {
  // in case balance is input without account, clear the balance
  voucherForm.value.lineItems
    .filter((item) => (item.debit != 0 || item.credit != 0) && !item.account)
    .forEach((item) => {
      item.debit = 0
      item.credit = 0
    })
  const lineItems: LineItemRequest[] = voucherForm.value.lineItems
    .map((item) => {
      return {
        ...item,
        text: voucherForm.value.headerText,
        accountNumber: item.account?.accountNumber as string,
        auxiliaryAccounts: item.auxiliaryAccounts?.map((aux) => ({
          categoryKey: aux.category.key,
          accountKey: aux.key as string,
        })),
      }
    })
    .filter((item) => item.accountNumber)
  voucherForm.value.totalDebit = lineItems.reduce((acc, item) => acc + item.debit, 0)
  voucherForm.value.totalCredit = lineItems.reduce((acc, item) => acc + item.credit, 0)

  // validate
  if (!voucherForm.value.headerText.trim()) {
    toast.action.add({ severity: 'error', detail: t('voucher.save.emptyHeaderText') })
    return
  }
  if (voucherForm.value.totalDebit != voucherForm.value.totalCredit) {
    toast.action.add({ severity: 'error', detail: t('voucher.save.notBalanced') })
    return
  }
  if (lineItems.length === 0 || voucherForm.value.totalDebit == 0) {
    toast.action.add({ severity: 'error', detail: t('voucher.save.emptyItems') })
    return
  }
  if (lineItems.flatMap((item) => item.auxiliaryAccounts ?? []).filter((aux) => !aux.accountKey).length > 0) {
    toast.action.add({ severity: 'error', detail: t('voucher.save.emptyAuxiliaryAccountKey') })
    return
  }

  // save
  if (!props.voucherId) {
    // create
    const { data } = await VoucherService.createVoucher(props.sobId, {
      ...voucherForm.value,
      creator: voucherForm.value.creator?.id as string,
      lineItems,
    })

    if (data) {
      toast.action.add({ severity: 'success', detail: t('voucher.save.success') })
      context?.refreshList.value()

      if (openCreated) {
        router.push({
          name: 'voucherDetail',
          params: { sobId: props.sobId, voucherId: data.id },
        })
        return
      }
    }
  } else {
    // update
    await VoucherService.updateVoucher(props.sobId, props.voucherId, {
      ...voucherForm.value,
      updater: user.id,
      lineItems,
    })
    editMode.value = false
    toast.action.add({ severity: 'success', detail: t('voucher.save.success') })
  }

  await load()
}

async function onCancel() {
  if (!props.voucherId) {
    router.push({ name: 'voucherMain' })
    return
  }
  editMode.value = false
  await load()
}

async function onAction(action: 'audit' | 'cancelAudit' | 'review' | 'cancelReview' | 'post') {
  if (!props.voucherId) {
    return
  }

  let resp
  switch (action) {
    case 'audit':
      resp = await VoucherService.auditVoucher(props.sobId, props.voucherId, user.id)
      break
    case 'cancelAudit':
      resp = await VoucherService.cancelAuditVoucher(props.sobId, props.voucherId, user.id)
      break
    case 'review':
      resp = await VoucherService.reviewVoucher(props.sobId, props.voucherId, user.id)
      break
    case 'cancelReview':
      resp = await VoucherService.cancelReviewVoucher(props.sobId, props.voucherId, user.id)
      break
    case 'post':
      resp = await VoucherService.postVoucher(props.sobId, props.voucherId, user.id)
  }

  if (resp?.exception) {
    return
  }

  await load()

  toast.action.add({ severity: 'success', detail: t('voucher.save.success') })
}
</script>

<template>
  <ObjectPage
    :title="voucherForm.documentNumber ?? t('voucher.creation.title')"
    :actions="voucherActions"
    @close="router.push({ name: 'voucherMain' })"
  >
    <template #attributes>
      <!-- voucher edit form -->
      <GridContainer v-if="editMode" class="flex gap-4">
        <div class="flex grow flex-col gap-1">
          <AppLabel for="header-text-input" required>{{ t('voucher.headerText') }}</AppLabel>
          <InputText id="header-text-input" v-model="voucherForm.headerText" fluid />
        </div>

        <div class="flex flex-col gap-1">
          <AppLabel for="transaction-time-input" required>{{ t('voucher.transactionTime') }}</AppLabel>
          <DatePicker v-model="voucherForm.transactionTime" input-id="transaction-time-input" show-button-bar />
        </div>

        <div class="flex flex-col gap-1">
          <AppLabel for="attachment-quantity-input" required>{{ t('voucher.attachmentQuantity') }}</AppLabel>
          <InputNumber v-model="voucherForm.attachmentQuantity" input-id="attachment-quantity-input" fluid />
        </div>
      </GridContainer>

      <!-- voucher display -->
      <GridContainer v-else-if="voucher">
        <GridItem :label="t('voucher.headerText')">
          {{ voucher.headerText }}
        </GridItem>

        <GridItem :label="t('voucher.transactionTime')">
          {{ d(voucher.transactionTime, 'short') }}
        </GridItem>

        <GridItem :label="t('voucher.attachmentQuantity')">
          {{ voucher.attachmentQuantity }}
        </GridItem>

        <GridItem :label="t('common.status')" span="full">
          <div class="flex gap-1">
            <Tag v-if="voucher.isAudited" severity="success" :value="t('voucher.isAudited')" />
            <Tag v-else severity="warn" :value="t('voucher.notAudited')" />
            <Tag v-if="voucher.isReviewed" severity="success" :value="t('voucher.isReviewed')" />
            <Tag v-else severity="warn" :value="t('voucher.notReviewed')" />
            <Tag v-if="voucher.isPosted" severity="success" :value="t('voucher.isPosted')" />
            <Tag v-else severity="warn" :value="t('voucher.notPosted')" />
          </div>
        </GridItem>
      </GridContainer>
    </template>

    <template #extra>
      <!-- voucher edit form -->
      <DataTable v-if="editMode" :value="voucherForm.lineItems">
        <Column :exportable="false">
          <template #body="{ index }">
            <ButtonGroup>
              <Button
                icon="pi pi-plus"
                text
                rounded
                :aria-label="t('action.add')"
                :disabled="voucherForm.lineItems.length > 48"
                @click="onAddLineItem(index + 1)"
              />
              <Button
                icon="pi pi-minus"
                text
                rounded
                :aria-label="t('action.remove')"
                :disabled="voucherForm.lineItems.length === 1"
                @click="onRemoveLineItem(index)"
              />
            </ButtonGroup>
          </template>
        </Column>

        <Column :header="t('voucher.account')" style="min-width: 12rem">
          <template #body="{ data }: { data: VoucherFormLineItem }">
            <div class="flex flex-col gap-2">
              <AccountInput
                :sob-id="sobId"
                :account-id="data.account?.id"
                only-leaves
                @change="(a) => onAccountSelect(a, data)"
              />

              <template v-if="data.auxiliaryAccounts">
                <InputGroup v-for="(category, index) in data.account?.auxiliaryCategories" :key="category.key">
                  <InputGroupAddon>{{ category.title }}</InputGroupAddon>
                  <Select
                    v-model="data.auxiliaryAccounts[index]"
                    :options="auxiliaryAccountOptions[category.key]"
                    :option-label="(item) => `${item.key} ${item.title}`"
                    fluid
                  />
                </InputGroup>
              </template>
            </div>
          </template>
        </Column>

        <Column :header="t('voucher.debit')" style="min-width: 12rem">
          <template #body="{ data }">
            <InputNumber v-model="data.debit" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" fluid />
          </template>
        </Column>

        <Column :header="t('voucher.credit')" style="min-width: 12rem">
          <template #body="{ data }">
            <InputNumber v-model="data.credit" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" fluid />
          </template>
        </Column>
      </DataTable>

      <!-- voucher display -->
      <DataTable v-else-if="voucher" :value="voucher.lineItems">
        <Column :header="t('voucher.account')">
          <template #body="{ data }">
            <div v-if="data.account" class="flex flex-col gap-2 text-nowrap">
              <span>{{ data.account.accountNumber }} {{ data.account.title }}</span>
              <span
                v-for="(category, index) in data.account.auxiliaryCategories"
                :key="category.key"
                class="flex gap-2"
              >
                <span>{{ category.title }}:</span>
                <span>{{ data.auxiliaryAccounts[index].key }} {{ data.auxiliaryAccounts[index].title }}</span>
              </span>
            </div>
          </template>
        </Column>

        <Column :header="t('voucher.debit')" style="width: 12rem">
          <template #body="{ data }">
            <span class="text-nowrap">{{ data.debit ? n(data.debit, 'decimal') : '' }}</span>
          </template>
        </Column>

        <Column :header="t('voucher.credit')" style="width: 12rem">
          <template #body="{ data }">
            <span class="text-nowrap">{{ data.credit ? n(data.credit, 'decimal') : '' }}</span>
          </template>
        </Column>

        <template #footer>
          <div class="flex gap-2">
            <span class="font-bold">{{ t('common.total') }}:</span>
            <span>{{ n(voucher.debit, 'decimal') }}</span>
          </div>
        </template>
      </DataTable>
    </template>
  </ObjectPage>
</template>
