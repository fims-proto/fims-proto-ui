<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Sob from '../domain/Sob';

export default defineComponent({
  setup() {
    const sobs = ref<Array<any>>()

    onMounted(async () => {
      sobs.value = await Sob.getAllSods()
    })

    return {
      sobs
    }
  }
})
</script>

<template>
  <div>
    <p>sob main page</p>
    <div v-for="sob in sobs" :key="sob.Id">
      <router-link :to="{ name: 'sobDetail', params: { sobId: sob.Id } }">{{ sob.Name }}</router-link>
    </div>
  </div>
</template>