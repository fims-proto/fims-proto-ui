<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePage from './BasePage.vue'

export default defineComponent({
  components: { BasePage },
  setup() {
    const t = useI18n().t

    return {
      t
    }
  }
})
</script>

<template>
  <base-page>
    <template #title>{{ t('sob.creation.title') }}</template>
  </base-page>
</template>