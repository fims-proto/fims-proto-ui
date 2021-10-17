<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";
import Auth from "../domain/Auth";

export default defineComponent({
  setup() {
    const user = ref(Auth.getUserInfo())
    const logout = () => {
      Auth.logout()
    }
    return {
      user,
      logout
    }
  }
})
</script>

<template>
  <header>
    <div class="leftHeader">
      <a class="appTitle" href="/">FIMS</a>
    </div>

    <div class="rightHeader">
      <div class="currentUser">
        <span>Hello!&nbsp;</span>
        <a href="/user/settings">{{ user?.lastName }} {{ user?.firstName }}</a>
      </div>
      <a @click="logout">logout</a>
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