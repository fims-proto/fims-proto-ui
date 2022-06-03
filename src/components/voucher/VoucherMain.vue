<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, Voucher } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()

const vouchers = ref<Voucher[]>([])

onMounted(async () => {
  vouchers.value = await VoucherService.getAllVouchersBySod(props.sobId)
})

const onCreate = () => {
  router.push({
    name: 'voucherCreation',
    params: {
      sobId: props.sobId,
    },
  })
}
</script>

<template>
  <base-page>
    <template #title>{{ t('voucher.title') }}</template>
    <template #extra>
      <base-button category="primary" @click="onCreate">{{ t('action.create') }}</base-button>
    </template>
    <div>
      <div v-if="vouchers.length">
        <p v-for="voucher in vouchers" :key="voucher.id">
          <base-link :to="{ name: 'voucherDetail', params: { sobId, voucherId: voucher.id } }">{{
            voucher.number
          }}</base-link>
        </p>
      </div>
      <span v-else>no voucher</span>
    </div>
  </base-page>
</template>
