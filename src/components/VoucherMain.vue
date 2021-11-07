<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Voucher from '../domain/Voucher';

export default defineComponent({
  setup() {
    const { t } = useI18n()
    const { sobId } = useRoute().params
    const vouchers = ref<Array<any>>()

    onMounted(async () => {
      vouchers.value = await Voucher.getAllVouchersBySod(sobId as string)
    })

    return {
      t,
      sobValid: !!sobId,
      vouchers
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

    <p v-if="!vouchers?.length">No voucher</p>
    <el-table :data="vouchers">
      <el-table-column prop="Number" :label="t('voucher.main.numberLbl')" />
      <el-table-column prop="Debit" :label="t('voucher.main.debitLbl')" />
      <el-table-column prop="Credit" :label="t('voucher.main.creditLbl')" />
    </el-table>
  </div>
  <p v-else>{{ t('voucher.main.sobMissingErr') }}</p>
</template>