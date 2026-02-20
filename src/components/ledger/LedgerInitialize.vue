<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'

import { CLASS_OPTIONS, LedgerService } from '@/services/general-ledger'
import type { PeriodAndLedgers } from '@/services/general-ledger/ledger'
import { useToastStore } from '@/store/toast'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'
import { treefyLedgers, calculateParentBalances, flattenTree } from './treefy'
import type { LedgerTreeNode } from './treefy'
import { createColumns } from './columns'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const toast = useToastStore()
const unsavedChanges = useUnsavedChangesStore()

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const periodAndLedgers = ref<PeriodAndLedgers>()
const ledgerTree = ref<LedgerTreeNode[]>([])
const originalData = ref<string>('') // For dirty checking

const period = computed(() => periodAndLedgers.value?.period)
const isPeriodClosed = computed(() => period.value?.isClosed ?? false)

const columns = computed(() => createColumns(isEditing.value, onBalanceChange))

const periodText = computed(() => {
  if (!period.value) return ''
  return t('period.periodText', [period.value.fiscalYear, period.value.periodNumber])
})

// Calculate trial balance - only count root level accounts (一级科目)
const trialBalance = computed(() => {
  // Only use root level accounts (no parent)
  const rootLedgers = ledgerTree.value

  const debitTotal = rootLedgers
    .filter((ledger) => ledger.account.balanceDirection === 'debit')
    .reduce((sum, ledger) => sum + ledger.openingBalance, 0)

  const creditTotal = rootLedgers
    .filter((ledger) => ledger.account.balanceDirection === 'credit')
    .reduce((sum, ledger) => sum + ledger.openingBalance, 0)

  const difference = Math.abs(debitTotal - creditTotal)
  const isBalanced = difference < 0.01 // Allow for floating point precision

  return {
    debitTotal,
    creditTotal,
    difference,
    isBalanced,
  }
})

const isDirty = computed(() => {
  const currentData = JSON.stringify(
    flattenTree(ledgerTree.value).map((l) => ({
      id: l.id,
      balance: l.openingBalance,
    })),
  )
  return currentData !== originalData.value
})

onMounted(() => {
  load()
})

// Watch dirty state and sync with unsaved changes store
watch(isDirty, (val) => {
  if (val) {
    unsavedChanges.action.enableProtection()
  } else {
    unsavedChanges.action.disableProtection()
  }
})

// Debounced calculation of parent balances
const recalculateParents = useDebounceFn(() => {
  calculateParentBalances(ledgerTree.value)
}, 300)

function onBalanceChange(ledger: LedgerTreeNode, value: number) {
  // Update the leaf account balance
  ledger.openingBalance = value || 0

  // Update the appropriate debit/credit field
  if (ledger.account.balanceDirection === 'debit') {
    ledger.openingDebitBalance = ledger.openingBalance
    ledger.openingCreditBalance = 0
  } else {
    ledger.openingCreditBalance = ledger.openingBalance
    ledger.openingDebitBalance = 0
  }

  // Recalculate parent balances
  recalculateParents()
}

async function load() {
  isLoading.value = true
  try {
    const { data } = await LedgerService.getFirstPeriodLedgers(props.sobId)

    if (!data) {
      return
    }
    periodAndLedgers.value = data
    ledgerTree.value = treefyLedgers(data.ledgers)

    // Calculate initial parent balances
    calculateParentBalances(ledgerTree.value)

    // Save original state for dirty checking
    originalData.value = JSON.stringify(
      flattenTree(ledgerTree.value).map((l) => ({
        id: l.id,
        balance: l.openingBalance,
      })),
    )
  } finally {
    isLoading.value = false
  }
}

function onEdit() {
  isEditing.value = true
}

function onCancel() {
  unsavedChanges.action.disableProtection()
  isEditing.value = false
  load() // Reload to discard changes
}

async function onSave() {
  // Validate trial balance
  if (!trialBalance.value.isBalanced) {
    toast.action.error(t('ledger.initialize.validation.mustBeBalanced'))
    return
  }

  isSaving.value = true
  try {
    // Collect only leaf account balances
    const allLedgers = flattenTree(ledgerTree.value)
    const leafLedgers = allLedgers.filter((ledger) => ledger.account.isLeaf)

    const request = {
      ledgers: leafLedgers.map((ledger) => ({
        accountNumber: ledger.account.accountNumber,
        openingBalance: ledger.openingBalance,
      })),
    }

    const { exception } = await LedgerService.initializeLedgers(props.sobId, request)
    if (exception) {
      return
    }

    toast.action.success(t('ledger.initialize.saveSuccess'))
    unsavedChanges.action.disableProtection()

    // Reload data
    await load()
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <PageFrame :title="$t('ledger.initialize.title')" :dirty-indicator="isDirty" no-scroll>
    <template #start>
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground text-sm">
          {{ $t('ledger.initialize.firstPeriod', [periodText]) }}
        </span>
        <Badge v-if="isPeriodClosed" variant="secondary">
          {{ $t('period.closed') }}
        </Badge>
        <p v-if="isPeriodClosed" class="text-sm text-amber-600">
          {{ $t('ledger.initialize.periodClosed') }}
        </p>
      </div>
    </template>

    <template #end>
      <!-- Display mode buttons -->
      <template v-if="!isEditing && !isPeriodClosed">
        <Button :disabled="isLoading" @click="onEdit">
          {{ $t('action.edit') }}
        </Button>
      </template>

      <!-- Edit mode buttons -->
      <template v-if="isEditing">
        <Button :disabled="!isDirty || !trialBalance.isBalanced || isSaving" :loading="isSaving" @click="onSave">
          {{ $t('action.save') }}
        </Button>
        <Button variant="ghost" :disabled="isSaving" @click="onCancel">
          {{ $t('action.cancel') }}
        </Button>
      </template>
    </template>

    <div class="flex h-full flex-col">
      <!-- Trial Balance Summary -->
      <Card class="mb-4 shrink-0">
        <CardContent>
          <div class="grid grid-cols-3 gap-4">
            <!-- Debit Total -->
            <div class="space-y-1">
              <p class="text-muted-foreground text-sm">
                {{ $t('ledger.initialize.totalDebit') }}
              </p>
              <p class="text-2xl font-bold">
                {{ $n(trialBalance.debitTotal, 'decimal') }}
              </p>
            </div>

            <!-- Credit Total -->
            <div class="space-y-1">
              <p class="text-muted-foreground text-sm">
                {{ $t('ledger.initialize.totalCredit') }}
              </p>
              <p class="text-2xl font-bold">
                {{ $n(trialBalance.creditTotal, 'decimal') }}
              </p>
            </div>

            <!-- Balance Status -->
            <div class="space-y-1">
              <p class="text-muted-foreground text-sm">
                {{ $t('ledger.initialize.status') }}
              </p>
              <div class="flex items-center gap-2">
                <Badge v-if="trialBalance.isBalanced" class="bg-green-600">
                  {{ $t('ledger.initialize.balanced') }}
                </Badge>
                <Badge v-else variant="destructive">
                  {{ $t('ledger.initialize.notBalanced', [$n(trialBalance.difference, 'decimal')]) }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="min-h-0 flex-1">
        <DataTable
          :columns="columns"
          :data="ledgerTree"
          :faceted-filters="[
            {
              name: 'class',
              title: $t(`account.class`),
              options: CLASS_OPTIONS.map((c) => ({ label: $t(`account.classEnum.${c}`), value: c })),
            },
          ]"
          :get-sub-rows="(row) => row.children"
          initial-expanded
        />
      </div>
    </div>
  </PageFrame>
</template>
