<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, Voucher, User, UserService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t, d, n } = useI18n()
const router = useRouter()

const vouchers = ref<Voucher[]>([])
const users: Record<string, User> = {}

onMounted(async () => {
  const { data } = await VoucherService.getAllVouchersBySod(props.sobId)
  vouchers.value = data ?? []
  for (const voucher of vouchers.value) {
    voucher.creator = await whoIs(voucher.creator)
    voucher.auditor = await whoIs(voucher.auditor)
    voucher.reviewer = await whoIs(voucher.reviewer)
  }
})

const onCreate = () => {
  router.push({
    name: 'voucherCreation',
    params: {
      sobId: props.sobId,
    },
  })
}

const onNav = (voucherId: string) => {
  router.push({
    name: 'voucherDetail',
    params: {
      sobId: props.sobId,
      voucherId: voucherId,
    },
  })
}

const whoIs = async (userId: string) => {
  if (!userId) {
    return ''
  }
  let traits = undefined
  if (!users[userId]) {
    const { data, exception } = await UserService.whoIs(userId)
    if (exception) {
      return ''
    }
    users[userId] = data as User
  }
  traits = users[userId].traits
  return t('common.userName', { lastName: traits.name?.last, firstName: traits.name?.first })
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('voucher.title') }}</template>
    <template #extra>
      <BaseButton type="primary" @click="onCreate">{{ t('action.create') }}</BaseButton>
    </template>

    <div v-if="vouchers.length" class="w-full overflow-clip border border-neutral-300 shadow-lg rounded-md">
      <table class="w-full table-fixed">
        <tr class="bg-neutral-100">
          <th class="border-b border-neutral-200 py-2 px-4 text-left w-48">{{ t('voucher.transactionTime') }}</th>
          <th class="border-b border-neutral-200 py-2 px-4 text-left w-32">{{ t('voucher.number') }}</th>
          <th class="border-b border-neutral-200 py-2 px-4 text-left">{{ t('voucher.summary') }}</th>
          <th class="border-b border-neutral-200 py-2 px-4 text-left w-32">{{ t('voucher.creator') }}</th>
          <th class="border-b border-neutral-200 py-2 px-4 text-left w-32">{{ t('voucher.auditor') }}</th>
          <th class="border-b border-neutral-200 py-2 px-4 text-right w-48">{{ t('voucher.amount') }}</th>
        </tr>
        <tr
          v-for="voucher in vouchers"
          :key="voucher.id"
          class="rounded-md hover:text-primary-700 hover:bg-neutral-200/50 hover:shadow-inner focus:outline-none focus:ring-inset focus:ring focus:ring-primary-500"
          role="button"
          tabindex="0"
          @click="onNav(voucher.id)"
        >
          <td class="border-t border-neutral-200 py-2 px-4 text-left w-48">{{ d(voucher.transactionTime, 'date') }}</td>
          <td class="border-t border-neutral-200 py-2 px-4 text-left w-32">{{ voucher.number }}</td>
          <td class="border-t border-neutral-200 py-2 px-4 text-left">{{ voucher.lineItems[0].summary }}</td>
          <td class="border-t border-neutral-200 py-2 px-4 text-left w-32">{{ voucher.creator }}</td>
          <td class="border-t border-neutral-200 py-2 px-4 text-left w-32">{{ voucher.auditor }}</td>
          <td class="border-t border-neutral-200 py-2 px-4 text-right w-48">{{ n(voucher.debit, 'decimal') }}</td>
        </tr>
      </table>
    </div>

    <span v-else>no vouchers</span>
  </BasePage>
</template>
