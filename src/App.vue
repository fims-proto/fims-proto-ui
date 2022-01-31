<script lang="ts">
import { defineComponent, toRefs, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { SobService } from './domain';
import { useSobStore } from './store/sob';
import { useUserStore } from './store/user';

export default defineComponent({
  setup() {
    const t = useI18n().t
    const sobStore = useSobStore()
    const userStore = useUserStore()
    const { user } = toRefs(userStore.state)

    userStore.action.loadUser()

    const initialize = async () => {
      console.log('start initialization')
      try {
        sobStore.action.setSobs(await SobService.getAllSods())
        sobStore.action.loadCurrentSob()
      } catch (error) {
        console.error(t((error as Error).message))
      }
    }

    watchEffect(() => {
      if (user.value.id) {
        initialize()
      }
    })
  }
})
</script>

<template>
  <router-view></router-view>
</template>
