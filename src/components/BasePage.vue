<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
      <div class="base-page__header__title">
        <slot name="title"></slot>
      </div>

      <div class="base-page__header_subtitle">
        <a-typography-text type="secondary">{{ subtitle }}</a-typography-text>
      </div>

      <div class="base-page__header__extra">
        <slot name="extra"></slot>
      </div>
    </header>

    <main class="base-page__main">
      <slot>
        <a-empty />
      </slot>
    </main>
  </div>
</template>

<style scoped>
.base-page__header {
  display: flex;
  gap: 1rem;
}

.base-page__header__title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bolder;
}

.base-page__header_subtitle {
  display: flex;
  align-items: center;
}

.base-page__header__extra {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.base-page__main {
  padding-top: 1rem;
}
</style>