<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const jwt = ref('')
    const error = ref('')

    onMounted(async () => {
      try {
        const response = await fetch('http://127.0.0.1:4455/fims/s/devops/jwt', { credentials: "include" })
        jwt.value = await response.text()
      } catch (err) {
        error.value = 'Request failed'
        console.log(err);
      }
    })

    return {
      jwt,
      error
    }
  }
})
</script>
<template>
  <p v-if="error">{{ error }}</p>
  <p v-else>{{ jwt }}</p>
</template>