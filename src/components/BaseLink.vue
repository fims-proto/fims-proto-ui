<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { useRouter } from "vue-router";

export default defineComponent({
  emits: ['click'],
  props: {
    href: String
  },
  setup(_, { emit }) {
    const router = useRouter()
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLAnchorElement).pathname) {
        router.push((e.target as HTMLAnchorElement).pathname)
      } else {
        emit('click')
      }
    }
    return {
      onClick
    }
  }
})
</script>

<template>
  <a :href="href" @click.prevent="onClick">
    <slot></slot>
  </a>
</template>

<style scoped>
a {
  background-color: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: 0.5s ease;
}

a:visited {
  color: inherit;
}

a:hover {
  opacity: 0.6;
}
</style>