<script setup lang="ts">
import { watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useToastStore } from './store/toast'

const store = useToastStore()
const toast = useToast()

// primevue useToast() can only be used in component.
// in case we want to toast message in function, e.g. error-handler.ts, we can only use the ToastStore
// it's better we always use ToastStore
watch(
  () => store.state.message,
  (message) => {
    if (message) {
      // message is readonly here, yet ToastService requires a mutable variable
      toast.add({ ...message })
    }
  },
)
</script>

<template>
  <RouterView />
  <Toast />
  <ConfirmPopup />
</template>
