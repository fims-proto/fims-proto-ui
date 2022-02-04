<script lang="ts">
import { defineComponent, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SobService } from './domain';
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
      try {
        sobStore.action.setSobs(await SobService.getAllSods())
        sobStore.action.loadCurrentSob()
      } catch (error) {
        console.error(t((error as Error).message))
      }
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
