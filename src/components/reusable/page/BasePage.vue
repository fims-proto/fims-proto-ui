<script setup lang="ts">
defineProps<{
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="!!$slots['breadcrumb']" class="text-sm text-neutral-500">
      <slot name="breadcrumb"></slot>
    </div>

    <header class="flex justify-between items-center">
      <div class="flex gap-4 items-center">
        <button
          class="w-8 p-1 text-neutral-800 bg-transparent rounded-md hover:bg-neutral-200/50 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500"
          @click="$router.go(-1)"
        >
          <ChevronLeftSolidIcon />
        </button>
        <h1 class="font-medium text-neutral-800">
          <slot name="title"></slot>
        </h1>

        <div class="text-neutral-500 self-end">
          <span>{{ subtitle }}</span>
        </div>
      </div>

      <div class="flex gap-2 ml-auto">
        <slot name="extra"></slot>
      </div>
    </header>

    <main class="mt-4">
      <slot>
        <span>empty</span>
      </slot>
    </main>
  </div>
</template>
