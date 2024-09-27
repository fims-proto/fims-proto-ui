<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { useSobStore } from '../../store/sob'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const { sobs } = toRefs(sobStore.state)

sobStore.action.refreshSobs()

const onCreate = () => router.push({ name: 'sobNew' })
</script>

<template>
  <div>
    <!-- header -->
    <div class="flex justify-between">
      <span>{{ t('sob.title') }}</span>
      <div>
        <Button :label="t('action.create')" @click="onCreate" />
      </div>
    </div>
    <DataView :value="sobs" data-key="id">
      <template #list="{ items }">
        <ul class="flex flex-col">
          <li v-for="(item, index) in items" :key="index" :class="{ 'border-t border-surface-200': index !== 0 }">
            <RouterLink :to="{ name: 'sobDetail', params: { sobId: item.id } }" class="block p-2 cursor-pointer">
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </template>
    </DataView>
  </div>
</template>
