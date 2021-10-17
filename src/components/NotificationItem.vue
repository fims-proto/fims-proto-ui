<script lang="ts">
import { defineComponent, onMounted } from "@vue/runtime-core";
import { ref } from "vue";

export default defineComponent({
  emits: ['onHide'],
  setup(_, { attrs, emit }) {
    const { id, content, type = 'info', autoHide = true, autoHideDelayMs = 3000 } = attrs

    const display = ref(true)

    const hide = () => {
      display.value = false
      emit('onHide', id)
    }

    onMounted(() => {
      if (autoHide) {
        setTimeout(() => hide(), autoHideDelayMs as number)
      }
    })

    return {
      content,
      type,
      display
    }
  }
})
</script>

<template>
  <div v-if="display" :class="['messageBox', type]">{{ content }}</div>
</template>

<style scoped>
.messageBox {
  padding: 1rem;
  margin: 1rem;
  border: 1px solid var(--gray-500);
  border-radius: 6px;
}

.messageBox.success {
  background-color: var(--success);
  color: var(--light);
}

.messageBox.warning {
  background-color: var(--warning);
  color: var(--warning);
}

.messageBox.danger {
  background-color: var(--danger);
  color: var(--danger);
}
</style>