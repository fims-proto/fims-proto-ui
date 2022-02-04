<template>
  <section class="layout">
    <header class="layout__header">
      <layout-header />
    </header>
    <main class="layout__content">
      <router-view />
    </main>
  </section>
</template>

<style scoped>
.layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.layout__header {
  width: min(1440px, 100%);
  height: 64px;
  line-height: 64px;
  align-self: center;
  padding: 0 1rem;
}

.layout__content {
  width: min(1440px, 100%);
  height: calc(100vh - 64px);
  align-self: center;
  padding: 0 1rem;
}
</style>