<script setup lang="ts">
import { watch } from 'vue'
import { useSobStore } from './store/sob'
import { useUserStore } from './store/user'

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
</script>

<template>
  <RouterView />
  <TheNotificationPanel />
</template>
