<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useSobStore } from './store/sob'
import { useUserStore } from './store/user'

export default defineComponent({
  setup() {
    const sobStore = useSobStore()
    const userStore = useUserStore()

    userStore.action.loadUser()

    const initialize = async () => {
      console.log('start initialization')
      sobStore.action.loadWorkingSob()
    }

    watch(
      () => userStore.state.userId,
      (newUserId) => {
        if (newUserId) {
          initialize()
        }
      }
    )
  },
})
</script>

<template>
  <router-view />
</template>
