<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSobStore } from '../store/sob';
import BaseLink from './BaseLink.vue';

export default defineComponent({
  components: { BaseLink },
  emits: ['selected'],
  setup(_, { emit }) {
    const t = useI18n().t
    const sobStore = useSobStore()
    const { sobs, currentSob } = toRefs(sobStore.state)

    return {
      t,
      sobs,
      currentSob,
      emit,
      onSelectSob(sobId: string) {
        sobStore.action.setCurrentSob(sobId)
        emit('selected')
      }
    }
  }
})
</script>

<template>
  <a-list :data-source="sobs">
    <template #header>{{ t('sob.selectSob') }}</template>
    <template #renderItem="{ item }">
      <a-list-item>
        <a-space>
          <a-button type="text" @click="onSelectSob(item.id)">{{ item.name }}</a-button>
          <a-tag color="success" v-if="item.id === currentSob?.id">{{ t('sob.current') }}</a-tag>
        </a-space>
      </a-list-item>
    </template>
    <template #footer>
      <base-link :to="{ name: 'sobMain' }" @click="emit('selected')">{{ t('sob.manageSob') }}</base-link>
    </template>
  </a-list>
</template>
