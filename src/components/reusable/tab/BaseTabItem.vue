<template>
  <Tab v-slot="{ selected }" as="template">
    <button
      :class="[
        'py-1 px-4 rounded-md border border-transparent',
        'focus:outline-none focus:ring-offset-1 focus:ring-2 focus:ring-primary-500',
        selected ? 'text-primary-700 border-neutral-100 bg-white shadow-lg' : 'text-neutral-700 hover:text-primary-700',
      ]"
    >
      <slot></slot>
    </button>
  </Tab>
</template>
