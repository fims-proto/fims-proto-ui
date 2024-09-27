<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../../store/user'
import {
  AccountService,
  FilterFactory,
  VoucherService,
  type Account,
  type LineItemRequest,
  type Voucher,
} from '../../domain'
import type { AccountInputAccount, AccountInputAuxiliaryAccount, VoucherForm, VoucherFormLineItem } from './types'
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { AppLabel } from '../reusable/form'
import { useToastStore } from '../../store/toast'
import { useRouter } from 'vue-router'
import { injectContext } from './context'
import ConfirmButton from '../reusable/confirm-button/ConfirmButton.vue'

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
const factory = new FilterFactory<Account>()
const accountOptions = ref<AccountInputAccount[]>()
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

const refresh = async () => {
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

const fillAuxiliaryAccountOptions = async (account: AccountInputAccount) => {
  account.auxiliaryCategories?.forEach(async (category) => {
    const { data } = await AccountService.getAuxiliaryAccounts(props.sobId, category.key, { page: 1, size: 999 })
    if (data) {
      auxiliaryAccountOptions.value[category.key] = data.content
    }
  })
}

watch(() => props.voucherId, refresh, { immediate: true })

const onAddLineItem = (index: number) => voucherForm.value.lineItems.splice(index, 0, emptyLineItem())
const onRemoveLineItem = (index: number) => voucherForm.value.lineItems.splice(index, 1)

const onSearchAccount = async (event: AutoCompleteCompleteEvent) => {
  const filter = factory.and(
    factory.eq('isLeaf', 'true'),
    factory.or(factory.ctn('accountNumber', event.query), factory.ctn('title', event.query)),
  )
  const { data } = await AccountService.searchAccounts(props.sobId, { page: 1, size: 999 }, filter)
  accountOptions.value = data?.content
}

const onAccountSelect = async (account: AccountInputAccount, lineItem: VoucherFormLineItem) => {
  // add empty auxiliary account to line item
  lineItem.auxiliaryAccounts = account.auxiliaryCategories?.map((category) => ({ category }))
  await fillAuxiliaryAccountOptions(account)
}

const onSave = async (openCreated?: boolean) => {
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

  await refresh()
}

const onCancel = async () => {
  if (!props.voucherId) {
    router.back()
    return
  }
  editMode.value = false
  await refresh()
}

const onAction = async (action: 'audit' | 'cancelAudit' | 'review' | 'cancelReview' | 'post') => {
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

  await refresh()

  toast.action.add({ severity: 'success', detail: t('voucher.save.success') })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- action buttons -->
    <div class="flex gap-2 justify-end">
      <Button
        v-if="voucherId"
        :disabled="editMode || voucher?.isAudited || voucher?.isReviewed"
        :label="t('action.edit')"
        @click="editMode = true"
      />
      <Button v-if="editMode && !voucherId" :label="t('action.saveAndNew')" @click="onSave(false)" />
      <Button v-if="editMode" :label="t('action.save')" @click="onSave(true)" />
      <Button v-if="editMode" text :label="t('action.cancel')" @click="onCancel" />
      <Button
        v-if="voucherId && !voucher?.isAudited"
        :disabled="editMode"
        :label="t('voucher.audit')"
        @click="onAction('audit')"
      />
      <ConfirmButton
        v-if="voucherId && voucher?.isAudited"
        :disabled="editMode"
        :label="t('voucher.cancelAudit')"
        @accept="onAction('cancelAudit')"
      />
      <Button
        v-if="voucherId && !voucher?.isReviewed"
        :disabled="editMode"
        :label="t('voucher.review')"
        @click="onAction('review')"
      />
      <ConfirmButton
        v-if="voucherId && voucher?.isReviewed"
        :disabled="editMode"
        :label="t('voucher.cancelReview')"
        @accept="onAction('cancelReview')"
      />
      <Button
        v-if="voucherId && voucher?.isReviewed && voucher.isAudited && !voucher.isPosted"
        :label="t('voucher.post')"
        @click="onAction('post')"
      />
    </div>

    <!-- voucher edit form -->
    <div v-if="editMode">
      <!-- voucher header info -->
      <div class="flex gap-4">
        <div class="flex flex-col">
          <AppLabel for="header-text-input" required>{{ t('voucher.headerText') }}</AppLabel>
          <InputText id="header-text-input" v-model="voucherForm.headerText" fluid />
        </div>

        <div class="flex flex-col">
          <AppLabel for="transaction-time-input" required>{{ t('voucher.transactionTime') }}</AppLabel>
          <DatePicker v-model="voucherForm.transactionTime" input-id="transaction-time-input" show-button-bar />
        </div>

        <div class="flex flex-col">
          <AppLabel for="attachment-quantity-input" required>{{ t('voucher.attachmentQuantity') }}</AppLabel>
          <InputNumber v-model="voucherForm.attachmentQuantity" input-id="attachment-quantity-input" fluid />
        </div>
      </div>

      <!-- line items -->
      <DataTable :value="voucherForm.lineItems">
        <Column :exportable="false" style="width: 8rem">
          <template #body="{ index }">
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
          </template>
        </Column>

        <Column :header="t('voucher.account')">
          <template #body="{ data }">
            <div class="flex flex-col gap-2">
              <AutoComplete
                v-model="data.account"
                :option-label="(item) => `${item.accountNumber} ${item.title}`"
                force-selection
                :suggestions="accountOptions"
                @complete="onSearchAccount"
                @option-select="(e) => onAccountSelect(e.value, data)"
              />

              <InputGroup v-for="(category, index) in data.account?.auxiliaryCategories" :key="category.key">
                <InputGroupAddon>{{ category.title }}</InputGroupAddon>
                <Select
                  v-model="data.auxiliaryAccounts[index]"
                  :options="auxiliaryAccountOptions[category.key]"
                  :option-label="(item) => `${item.key} ${item.title}`"
                  fluid
                />
              </InputGroup>
            </div>
          </template>
        </Column>

        <Column :header="t('voucher.debit')">
          <template #body="{ data }">
            <InputNumber v-model="data.debit" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" />
          </template>
        </Column>

        <Column :header="t('voucher.credit')">
          <template #body="{ data }">
            <InputNumber v-model="data.credit" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- voucher display -->
    <div v-else-if="voucher">
      <!-- voucher header info -->
      <div class="flex justify-between">
        <div class="flex gap-2">
          <span>{{ t('voucher.headerText') }}:</span>
          <span>{{ voucher.headerText }}</span>
        </div>

        <div class="flex gap-2">
          <span>{{ t('voucher.transactionTime') }}:</span>
          <span>{{ d(voucher.transactionTime, 'short') }}</span>
        </div>

        <div class="flex gap-2">
          <span>{{ t('voucher.attachmentQuantity') }}:</span>
          <span>{{ voucher.attachmentQuantity }}</span>
        </div>
      </div>

      <!-- line items -->
      <DataTable :value="voucher.lineItems">
        <Column :header="t('voucher.account')">
          <template #body="{ data }">
            <div v-if="data.account" class="flex flex-col gap-2">
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

        <Column :header="t('voucher.debit')">
          <template #body="{ data }">
            <span>{{ n(data.debit, 'decimal') }}</span>
          </template>
        </Column>

        <Column :header="t('voucher.credit')">
          <template #body="{ data }">
            <span>{{ n(data.credit, 'decimal') }}</span>
          </template>
        </Column>

        <template #footer>
          <div class="flex gap-2 justify-end">
            <span class="bold">{{ t('voucher.total') }}</span>
            <span>{{ n(voucher.debit, 'decimal') }}</span>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
