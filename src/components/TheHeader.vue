<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import { useStore } from "vuex";
import Auth from "../domain/Auth";
import Notifier from "../domain/Notifier";
import BaseLink from "./BaseLink.vue";
import LogoutIcon from '~icons/mdi/logout';

export default defineComponent({
  components: { BaseLink, LogoutIcon },
  setup() {
    const store = useStore()
    return {
      user: computed(() => store.state.auth.user),
      logout: () => Auth.logout(),
      notify: () => Notifier.push({ content: 'test', type: 'success' })
    }
  }
})
</script>

<template>
  <header>
    <div class="leftHeader">
      <BaseLink class="appTitle" href="/">FIMS</BaseLink>
    </div>

    <div class="rightHeader">
      <BaseLink @click="notify">notify</BaseLink>&nbsp;
      <div class="currentUser">
        <span>Hello!&nbsp;</span>
        <BaseLink href="/user/settings">{{ user?.lastName }} {{ user?.firstName }}</BaseLink>
      </div>
      <BaseLink @click="logout">
        <logout-icon />
      </BaseLink>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: var(--dark);
  color: var(--light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.rightHeader {
  display: flex;
}

.currentUser {
  margin-right: 1rem;
}
</style>