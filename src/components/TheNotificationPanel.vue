<script setup lang="ts">
import { toRefs } from 'vue'
import { useNotificationStore } from '../store/notification'

const notificationStore = useNotificationStore()
const { notifications } = toRefs(notificationStore.state)
const onClose = (id: string) => notificationStore.action.remove(id)
</script>

<template>
  <ul
    v-show="notifications.length"
    class="fixed w-96 max-h-full min-h-[] top-0 right-4 px-4 pt-4 pb-8 flex flex-col gap-4 z-50 overflow-y-auto"
  >
    <li v-for="notification in notifications.slice().reverse()" :key="notification.id">
      <BaseNotification
        :type="notification.type"
        :message="notification.message"
        :duration="notification.duration ?? 5"
        :closable="notification.closable ?? notification.duration === 0"
        @close="onClose(notification.id as string)"
      />
    </li>
  </ul>
</template>
