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
    <div class="currentUser">{{ user?.lastName }}{{ user?.firstName }}</div>
    <button @click="logout">logout</button>
  </header>
</template>