<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import NotificationList from './components/NotificationList.vue'

export default defineComponent({
  components: { NotificationList }
})
</script>

<template>
  <router-view></router-view>
  <NotificationList />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app * {
  box-sizing: border-box;
}
</style>
