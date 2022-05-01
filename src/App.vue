<script lang="ts">
import { defineComponent, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSobStore } from './store/sob';
import { useUserStore } from './store/user';

export default defineComponent({
  setup() {
    const t = useI18n().t
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
  <router-view></router-view>
</template>
