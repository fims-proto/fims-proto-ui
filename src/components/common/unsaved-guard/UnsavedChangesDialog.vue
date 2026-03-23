<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from 'vue-i18n'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const { t } = useI18n()

function onOpenChange(val: boolean) {
  if (!val) emit('cancel')
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent :show-close-button="false">
      <DialogHeader>
        <DialogTitle>{{ t('common.confirmationHeader') }}</DialogTitle>
        <DialogDescription>{{ t('common.unsavedChangedConfirmationText') }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="emit('cancel')">{{ t('common.cancel') }}</Button>
        <Button variant="ghost" @click="emit('confirm')">{{ t('common.confirm') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
