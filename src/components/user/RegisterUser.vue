<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UpdatePassword from '@/components/user/UpdatePassword.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex h-screen w-full items-center justify-center">
    <Card class="w-full max-w-md space-y-8 px-4 py-12">
      <CardHeader>
        <CardTitle>fims</CardTitle>
        <CardDescription>{{ t('user.registerPrompt') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePassword />
      </CardContent>
    </Card>
  </div>
</template>
