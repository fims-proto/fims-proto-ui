<template>
  <div style="padding: 5rem;">
    <p>
      Oops, exception occured. Go to
      <router-link :to="{ name: 'home' }">
        home
      </router-link>
      page.
    </p>
  </div>
</template>