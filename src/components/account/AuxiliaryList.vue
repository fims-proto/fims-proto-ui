<script setup lang="ts">
import { ref } from 'vue'
import { AccountService, type AuxiliaryCategory } from '../../domain'
import { onMounted } from 'vue'

const props = defineProps<{
  sobId: string
}>()

const auxiliaryCategories = ref<AuxiliaryCategory[]>([])

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
  <BaseList clickable hoverable>
    <BaseListItem
      v-for="auxiliaryCategory in auxiliaryCategories"
      :key="auxiliaryCategory.id"
      :value="auxiliaryCategory"
    >
      {{ auxiliaryCategory.title }}
    </BaseListItem>
  </BaseList>
</template>
