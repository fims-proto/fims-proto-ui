<script setup lang="ts">
import { ref } from 'vue'
import { AccountService, type AuxiliaryAccount, type AuxiliaryCategory } from '../../domain'
import { onMounted } from 'vue'

const props = defineProps<{
  sobId: string
}>()

const auxiliaryCategories = ref<AuxiliaryCategory[]>([])
const auxiliaryAccounts = ref<AuxiliaryAccount[]>([])

const onSelectAuxiliaryCategory = async (categoryKey: string) => {
  ;({ data: { content: auxiliaryAccounts.value } = { content: [] } } = await AccountService.getAuxiliaryAccountsByKey(
    props.sobId,
    categoryKey,
    { page: 1, size: 100 },
  ))
}

onMounted(async () => {
  ;({ data: { content: auxiliaryCategories.value } = { content: [] } } = await AccountService.getAuxiliaryCategories(
    props.sobId,
    {
      page: 1,
      size: 100,
    },
  ))
})
</script>

<template>
  <BaseSplitPage detail-size="L">
    <template #main>
      <BaseList clickable hoverable>
        <BaseListItem
          v-for="auxiliaryCategory in auxiliaryCategories"
          :key="auxiliaryCategory.id"
          :value="auxiliaryCategory"
          @click="onSelectAuxiliaryCategory(auxiliaryCategory.key)"
        >
          {{ auxiliaryCategory.title }}
        </BaseListItem>
      </BaseList>
    </template>

    <template #detail>
      <div v-if="auxiliaryAccounts.length > 0">
        <p v-for="auxiliaryAccount in auxiliaryAccounts" :key="auxiliaryAccount.id">
          {{ auxiliaryAccount.title }}
        </p>
      </div>
    </template>
  </BaseSplitPage>
</template>
