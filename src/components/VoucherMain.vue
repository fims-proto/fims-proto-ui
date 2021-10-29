<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const { t } = useI18n()

    const { sobId } = useRoute().params
    if (!sobId) {
      ElMessageBox.alert(t('voucher.main.sobMissingErr'))
    }

    return {
      t
    }
  }
})
</script>

<template>
  <div>
    <el-input :placeholder="t('voucher.main.searchPlaceholder')">
      <template #prefix>
        <i class="el-input__icon el-icon-search"></i>
      </template>
    </el-input>
  </div>
</template>