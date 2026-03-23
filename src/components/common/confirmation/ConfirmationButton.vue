<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    message: string
    title?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    disabled?: boolean
  }>(),
  {
    title: undefined,
    variant: 'default',
    size: 'default',
    disabled: false,
  },
)

const emit = defineEmits<{ confirm: [] }>()
const { t } = useI18n()
const open = ref(false)

function onConfirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button :variant="variant" :size="size" :disabled="disabled" :class="$attrs.class">
        <slot />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-72">
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold">{{ title || t('common.confirmationHeader') }}</p>
        <p class="text-muted-foreground text-sm">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="open = false">{{ t('common.cancel') }}</Button>
          <Button variant="destructive" size="sm" @click="onConfirm">{{ t('common.confirm') }}</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
