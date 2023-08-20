<script setup lang="ts">
import { useNotificationStore } from '../../store/notification'
import { type AppNotification } from '../../domain'

const notificationStore = useNotificationStore()
const onNewNotification = (text?: string) => {
  const index = Math.floor(Math.random() * 4)
  notificationStore.action.push({
    type: ['error', 'info', 'success', 'warning'][index] as AppNotification['type'],
    message: text ?? ['打雷啦', '下雨啦', '收衣服啦', '衣服掉地上啦'][index],
    duration: Math.floor(Math.random() * 4),
  })
}
</script>

<template>
  <div class="container mx-auto space-y-4">
    <!-- normal buttons -->
    <div class="flex gap-4">
      <BaseButton @click="onNewNotification('Ta-da!!')">Default</BaseButton>
      <BaseButton category="primary"> Primary </BaseButton>
      <BaseButton>
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Default
      </BaseButton>
      <BaseButton category="primary">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Primary
      </BaseButton>
      <BaseButton>
        <template #icon>
          <LockClosedMiniIcon />
        </template>
      </BaseButton>
      <!-- disabled -->
      <BaseButton disabled>Default</BaseButton>
      <BaseButton disabled category="primary"> Primary </BaseButton>
      <BaseButton disabled>
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Default
      </BaseButton>
      <BaseButton disabled category="primary">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Primary
      </BaseButton>
      <BaseButton category="flat">Flat</BaseButton>
      <BaseButton disabled category="flat">Flat</BaseButton>
    </div>

    <!-- small size -->
    <div class="flex gap-4">
      <BaseButton category="primary" size="S" @click="onNewNotification('Ta-da!!')">Primary</BaseButton>
      <BaseButton size="S">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Default
      </BaseButton>
      <BaseButton size="S">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
      </BaseButton>
      <!-- disabled -->
      <BaseButton disabled size="S">Default</BaseButton>
      <BaseButton disabled size="S">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        Default
      </BaseButton>
      <BaseButton category="flat" size="S">Flat</BaseButton>
      <BaseButton disabled category="flat" size="S">Flat</BaseButton>
    </div>

    <!-- grouped button -->
    <div class="flex gap-4">
      <BaseButtonGroup>
        <BaseButton>
          <template #icon><LockClosedMiniIcon /></template>Fisrt
        </BaseButton>
        <BaseConfirmationButton @click="onNewNotification('2nd Thoughts!!')">2nd thought</BaseConfirmationButton>
        <BaseButton>Third</BaseButton>
      </BaseButtonGroup>

      <BaseButtonGroup>
        <BaseButton disabled>
          <template #icon><LockClosedMiniIcon /></template>Fisrt
        </BaseButton>
        <BaseButton disabled>Second</BaseButton>
      </BaseButtonGroup>
    </div>
    <br />

    <!-- with style class -->
    <div class="flex gap-4">
      <BaseButton category="primary" class="w-64">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        <span>固定宽度居中</span>
      </BaseButton>

      <BaseButton disabled category="primary" class="w-64">
        <template #icon>
          <LockClosedMiniIcon />
        </template>
        <span>固定宽度但禁止</span>
      </BaseButton>
    </div>
    <br />

    <!-- double confirm -->
    <div class="flex gap-4">
      <BaseConfirmationButton category="primary" @click="onNewNotification('Ta-da after confirmation!!')">
        重要事件
      </BaseConfirmationButton>
    </div>
  </div>
</template>
