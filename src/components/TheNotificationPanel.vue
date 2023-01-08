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
    class="fixed w-1/2 max-h-full top-0 left-1/2 -translate-x-1/2 pt-20 px-4 pb-8 flex flex-col gap-4 z-50 overflow-y-auto"
  >
    <li v-for="notification in notifications.slice().reverse()" :key="notification.id">
      <BaseNotification
        :type="notification.type"
        :message="notification.message"
        :duration="notification.duration ?? 3"
        :closable="notification.closable ?? notification.duration === 0"
        @close="onClose(notification.id as string)"
      />
    </li>
  </ul>
</template>
