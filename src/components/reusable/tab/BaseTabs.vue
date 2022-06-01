<template>
  <tab-group manual>
    <tab-list class="flex gap-1">
      <slot name="tabs"></slot>
    </tab-list>
    <tab-panels>
      <slot name="panels"></slot>
    </tab-panels>
  </tab-group>
</template>
