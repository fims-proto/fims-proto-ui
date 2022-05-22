<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, UserService, Voucher, VoucherService } from '../../domain'

export default defineComponent({
  props: {
    sobId: {
      type: String,
      required: true,
    },
    voucherId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const voucher = ref<Voucher>()
    const creator = ref<User>()
    const editMode = ref(false)

    onMounted(async () => {
      voucher.value = await VoucherService.getVoucherById(props.sobId, props.voucherId)
      creator.value = await UserService.whoIs(voucher.value.creator)
    })

    return {
      t,
      editMode,
      voucher,
      creator,
    }
  },
})
</script>

<template>
  <base-page>
    <template #title>{{ voucher?.number }}</template>
    <template #extra>
      <base-button @click="editMode = true">{{ t('action.edit') }}</base-button>
      <base-button @click="editMode = false">{{ t('action.save') }}</base-button>
    </template>
    <voucher-form
      v-if="voucher && creator"
      :disabled="!editMode"
      :attachment-quantity="voucher.attachmentQuantity"
      :transaction-time="voucher.transactionTime"
      :line-items="voucher.lineItems"
      period="period 暂定"
      :creator="creator.traits"
    />
  </base-page>
</template>
