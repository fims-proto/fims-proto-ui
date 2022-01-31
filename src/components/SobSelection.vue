<script lang="ts">
import { NButton, NList, NListItem, NTag } from 'naive-ui';
import { defineComponent, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSobStore } from '../store/sob';
import BaseLink from './BaseLink.vue';

export default defineComponent({
  components: { NList, NListItem, NButton, NTag, BaseLink },
  emits: ['selected'],
  setup(_, { emit }) {
    const t = useI18n().t
    const router = useRouter()
    const sobStore = useSobStore()
    const { sobs, currentSob } = toRefs(sobStore.state)

    return {
      t,
      sobs,
      currentSob,
      onSelectSob(sobId: string) {
        sobStore.action.setCurrentSob(sobId)
        emit('selected')
      },
      onSelectManage() {
        router.push({ name: 'sobMain' })
        emit('selected')
      }
    }
  }
})
</script>

<template>
  <div class="sob-selection">
    <n-list bordered>
      <template #header>{{ t('sob.selectSob') }}</template>
      <n-list-item v-for="sob in sobs" :key="sob.id">
        <template v-if="sob.id === currentSob?.id" #prefix>
          <n-tag type="success" size="small">{{ t('sob.current') }}</n-tag>
        </template>
        <n-button text @click="onSelectSob(sob.id)">{{ sob.name }}</n-button>
      </n-list-item>
      <n-list-item>
        <n-button text @click="onSelectManage">{{ t('sob.manageSob') }}</n-button>
      </n-list-item>
    </n-list>
  </div>
</template>

<style scoped>
.sob-selection {
  background-color: var(--n-color);
  width: 20rem;
}
</style>