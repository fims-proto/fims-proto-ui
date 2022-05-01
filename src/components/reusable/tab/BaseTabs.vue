<template>
  <tab-group>
    <tab-list class="flex gap-6">
      <slot name="tabs"></slot>
    </tab-list>
    <tab-panels>
      <slot name="panels"></slot>
    </tab-panels>
  </tab-group>
</template>