<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Sob } from '@domain/sob'
import { useSobStore } from '@store/sob'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const { sobs } = toRefs(sobStore.state)
const selectedSob = ref<Sob>()

sobStore.action.refreshSobs()

function onSelect(selected: Sob) {
  router.push({
    name: 'sobDetail',
    params: {
      sobId: selected.id,
    },
  })
}
</script>

<template>
  <div>
    <DataTable
      :value="sobs"
      v-model:selection="selectedSob"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      @update:selection="onSelect"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span>{{ t('sob.listTitle', [sobs.length]) }}</span>
          <Button as="router-link" :label="t('action.create')" :to="{ name: 'sobNew' }" />
        </div>
      </template>

      <Column :header="t('sob.name')" field="name" />
    </DataTable>
  </div>
</template>
