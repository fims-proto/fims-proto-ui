<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, Sob, Voucher } from '../../domain'

export default defineComponent({
  props: {
    sob: {
      type: Object as PropType<Sob>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const router = useRouter()

    const vouchers = ref<Voucher[]>([])

    onMounted(async () => {
      vouchers.value = await VoucherService.getAllVouchersBySod(props.sob.id)
    })

    const onCreate = () => {
      router.push({
        name: 'voucherCreation',
        params: {
          sobId: props.sob.id,
        },
      })
    }

    return {
      t,
      vouchers,
      onCreate,
    }
  },
})
</script>

<template>
  <base-page subtitle="##当前账套下全部凭证">
    <template #title>{{ t('voucher.title') }}</template>
    <template #extra>
      <base-button category="primary" @click="onCreate">{{ t('action.create') }}</base-button>
    </template>
    <div>
      <div v-if="vouchers.length">
        <p v-for="voucher in vouchers" :key="voucher.id">{{ voucher.number }}</p>
      </div>
      <span v-else>no voucher</span>
    </div>
  </base-page>
</template>
