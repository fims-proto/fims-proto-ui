<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { computed } from 'vue';
import { RouteLocationMatched, RouteParams, useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const route = useRoute()

    const crumbs = computed(() => {
      if (route.path === '/') {
        // it's home page. hide breadcrumb
        return []
      }

      const paths = route.path.split('/')

      let crumbUrl = '/'

      return paths.map((path, index) => {
        crumbUrl += `/${path}`
        if (crumbUrl.substring(0, 2) === '//') {
          // remove one of duplicated /
          crumbUrl = crumbUrl.substring(1)
        }

        return {
          name: route.matched[index]?.name,
          url: crumbUrl,
          id: getParamValue(route.matched[index], route.params)
        }
      })
    })

    return {
      crumbs
    }
  }
})

function getParamValue(route: RouteLocationMatched, currentParams: RouteParams) {
  const m = route.path.match(/.+:([^\/]+)$/)
  return m ? currentParams[m[1]] : ''
}
</script>

<template>
  <div>
    <template v-for="(crumb, index) in crumbs" :key="crumb.name">
      <router-link
        v-if="index !== crumbs.length - 1"
        :to="crumb.url"
        class="breadcrumbItem"
      >{{ crumb.name }}{{ crumb.id }}</router-link>
      <span v-else>{{ crumb.name }}{{ crumb.id }}</span>
      <span v-if="index !== crumbs.length - 1" class="breadcrumbSeparator">&gt;</span>
    </template>
  </div>
</template>

<style scoped>
.breadcrumbItem {
  color: var(--gray-600);
}

.breadcrumbItem:hover {
  color: var(--primary);
}

.breadcrumbSeparator {
  display: inline-block;
  margin: 0 0.2rem;
  color: var(--gray-500);
}
</style>