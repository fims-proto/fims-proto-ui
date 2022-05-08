<template>
  <Tab v-slot="{ selected }" as="template">
    <button
      :class="[
        'py-3 border-b-2',
        selected ? 'text-primary-700 border-primary-700' : 'text-neutral-700 border-transparent hover:text-primary-700',
      ]"
    >
      <slot></slot>
    </button>
  </Tab>
</template>
