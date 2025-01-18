<script setup lang="ts">
defineProps<{
  model: MenuItem[]
}>()

export type MenuItem = {
  label: string
  command?: () => void
  icon?: string
  focused?: boolean
}
</script>

<template>
  <div>
    <ul class="flex flex-col gap-1">
      <li v-for="item in model">
        <a
          tabindex="-1"
          @click="item.command"
          class="text-color hover:text-hover-color group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 transition hover:bg-slate-300"
        >
          <i v-if="item.icon" :class="item.icon" class="text-slate-400 transition-colors group-hover:text-slate-500" />
          <span>{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
