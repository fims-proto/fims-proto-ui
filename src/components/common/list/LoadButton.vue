<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  loaded: number
  total: number
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <Button
    v-if="loaded < total"
    size="sm"
    variant="ghost"
    class="text-muted-foreground w-full text-xs font-normal"
    @click="$emit('click')"
  >
    {{ $t('common.loadMore', { loaded: loaded, total: total }) }}
  </Button>
  <span v-else class="text-muted-foreground block w-full py-2 text-center text-xs font-normal select-none">
    {{ $t('common.noMoreData') }}
  </span>
</template>
