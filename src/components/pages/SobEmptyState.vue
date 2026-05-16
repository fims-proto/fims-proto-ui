<script setup lang="ts">
import { FolderOpen, Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-3">
    <FolderOpen class="text-muted-foreground/30" :size="96" :stroke-width="2" />
    <p class="text-muted-foreground text-base font-medium">{{ $t('sob.sobUnselected') }}</p>
    <p class="text-muted-foreground/60 text-sm">{{ $t('sob.selectOrCreate') }}</p>
    <Button class="mt-2" @click="router.push({ name: 'sobNew' })">
      <Plus />
      {{ $t('action.create') }}
    </Button>
  </div>
</template>
