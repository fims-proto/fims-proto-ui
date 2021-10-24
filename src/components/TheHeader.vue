<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import { useStore } from "vuex";
import Auth from "../domain/Auth";
import BaseLink from "./BaseLink.vue";
import BaseDropdown from "./BaseDropdown.vue";
import BaseDropdownItem from "./BaseDropdownItem.vue";
import LogoutIcon from '~icons/mdi/logout';

export default defineComponent({
  components: { BaseDropdown, BaseDropdownItem, BaseLink, LogoutIcon },
  setup() {
    const store = useStore()
    return {
      user: computed(() => store.state.auth.user),
      logout: () => Auth.logout()
    }
  }
})
</script>

<template>
  <header class="header">
    <div class="leftHeader">
      <router-link class="appTitle" to="/">FIMS</router-link>
    </div>

    <div class="rightHeader">
      <div class="item">
        <router-link to="/sobs">sobs</router-link>
      </div>
      <div v-if="user" class="item currentUser">
        <base-dropdown :title="`${user?.lastName} ${user?.firstName}`">
          <base-dropdown-item>
            <router-link to="/user/settings">change profile</router-link>
          </base-dropdown-item>
          <base-dropdown-item :is-separater="true" />
          <base-dropdown-item>
            <base-link @click="logout">
              <logout-icon />logout
            </base-link>
          </base-dropdown-item>
        </base-dropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--dark);
  color: var(--light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.rightHeader {
  display: flex;
  justify-content: right;
  align-items: center;
}

.rightHeader .item {
  margin-left: 1rem;
}
</style>