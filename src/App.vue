<script setup lang="ts">
import { ConfirmationDialog } from '@/components/common/confirmation'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster position="bottom-center" rich-colors class="pointer-events-auto" />
  <ConfirmationDialog>
    <RouterView />
  </ConfirmationDialog>
</template>
