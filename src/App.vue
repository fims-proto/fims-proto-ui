<script lang="ts">
import { defineComponent, toRefs, watch } from 'vue';
import { useSobStore } from './store/sob';
import { useUserStore } from './store/user';

export default defineComponent({
  setup() {
    const sobStore = useSobStore()
    const userStore = useUserStore()
    const { userId } = toRefs(userStore.state)

    userStore.action.loadUser()

    const initialize = async () => {
      console.log('start initialization')
      sobStore.action.loadWorkingSob()
    }

    watch(userId, () => {
      if (userId.value) {
        initialize()
      }
    })
  }
})
</script>

<template>
  <router-view />
</template>
