<template>
  <TabGroup manual>
    <TabList class="flex gap-1">
      <slot name="tabs"></slot>
    </TabList>
    <TabPanels>
      <slot name="panels"></slot>
    </TabPanels>
  </TabGroup>
</template>
