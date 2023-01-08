<template>
  <Tab v-slot="{ selected }" as="template">
    <button
      :class="[
        'py-1 px-4 rounded-md border border-transparent',
        'focus:outline-none focus-visible:border-primary-600 focus-visible:ring focus-visible:ring-primary-600/50',
        selected ? 'text-primary-700 border-neutral-200 bg-white shadow-lg' : 'text-neutral-700 hover:text-primary-700',
      ]"
    >
      <slot></slot>
    </button>
  </Tab>
</template>
