<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const { t } = useI18n()
    const { sobId } = useRoute().params

    return {
      t,
      sobValid: !!sobId
    }
  }
})
</script>

<template>
  <div v-if="sobValid">
    <el-input :placeholder="t('voucher.main.searchPlaceholder')">
      <template #prefix>
        <i class="el-input__icon el-icon-search"></i>
      </template>
    </el-input>
  </div>
  <p v-else>{{ t('voucher.main.sobMissingErr') }}</p>
</template>