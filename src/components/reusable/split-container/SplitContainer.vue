<template>
  <div class="w-full h-full flex">
    <div class="w-4/12">
      <slot name="list"></slot>
    </div>
    <div class="w-8/12">
      <slot name="detail"></slot>
    </div>
  </div>
</template>
