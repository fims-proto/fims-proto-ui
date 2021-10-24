<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

export default defineComponent({
  props: {
    isDisabled: Boolean,
    isSeparater: Boolean
  }
})
</script>

<template>
  <li class="dropdownItem" :class="{ disabled: isDisabled, separater: isSeparater }">
    <slot>
      <hr />
    </slot>
  </li>
</template>

<style scoped>
.dropdownItem:not(.separater) {
  cursor: pointer;
}

.dropdownItem:hover {
  color: var(--light);
  background-color: var(--primary);
}
</style>