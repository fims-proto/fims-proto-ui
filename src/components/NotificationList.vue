<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import { useStore } from "vuex";
import Notifier from "../domain/Notifier";
import NotificationItem from "./NotificationItem.vue";

export default defineComponent({
  components: { NotificationItem },
  setup() {
    const store = useStore()

    const removeMessage = (messageId: string) => {
      Notifier.remove(messageId)
    }

    return {
      messages: computed(() => store.state.notification.messages),
      removeMessage
    }
  }
})
</script>

<template>
  <div class="notificationList">
    <template v-for="message in messages">
      <notification-item
        @on-hide="removeMessage"
        :id="message.id"
        :content="message.content"
        :type="message.type"
      />
    </template>
  </div>
</template>

<style scoped>
.notificationList {
  width: 20rem;
  position: absolute;
  top: var(--header-height);
  right: 1rem;
}
</style>