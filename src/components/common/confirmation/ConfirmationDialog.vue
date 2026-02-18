<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useConfirmationStore } from '@/store/confirmation'

const { t } = useI18n()
const confirmationStore = useConfirmationStore()

function onConfirm() {
  confirmationStore.state.onConfirm?.()
  confirmationStore.action.close()
}

function onCancel() {
  confirmationStore.state.onCancel?.()
  confirmationStore.action.close()
}

function onOpenChange(val: boolean) {
  if (!val) {
    onCancel()
  }
}
</script>

<template>
  <Dialog :open="confirmationStore.state.open" @update:open="onOpenChange">
    <slot />

    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ confirmationStore.state.title || t('common.confirmationHeader') }}</DialogTitle>
        <DialogDescription>{{ confirmationStore.state.message || t('common.confirmationText') }}</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button @click="onCancel">{{ $t('common.cancel') }}</Button>
        <Button variant="ghost" @click="onConfirm">{{ $t('common.confirm') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
