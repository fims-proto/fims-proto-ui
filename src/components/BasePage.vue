<script lang="ts">
import { NEmpty, NSpace, NText } from 'naive-ui';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { NSpace, NText, NEmpty },
  props: {
    subtitle: String
  },
  setup(_, { slots }) {
    const hasSlot = (name: string | number) => !!slots[name]
    return {
      hasSlot
    }
  }
})
</script>

<template>
  <div class="base-page">
    <div v-if="hasSlot('breadcrumb')" class="base-page__breadcrumb">
      <slot name="breadcrumb"></slot>
    </div>
    <header class="base-page__header">
      <n-space align="center" justify="space-between">
        <n-space align="baseline">
          <div class="base-page__header__title">
            <slot name="title"></slot>
          </div>
          <div class="base-page__header_subtitle">
            <n-text depth="3">{{ subtitle }}</n-text>
          </div>
        </n-space>
        <div class="base-page__header__extra">
          <slot name="extra"></slot>
        </div>
      </n-space>
    </header>
    <main class="base-page__main">
      <slot>
        <n-empty description="PAGE NOT IMPLEMENTED" />
      </slot>
    </main>
  </div>
</template>

<style scoped>
.base-page {
  width: 100%;
  height: 100%;
}

.base-page__header__title {
  font-size: 2rem;
  font-weight: bolder;
}

.base-page__main {
  padding-top: 1rem;
}
</style>