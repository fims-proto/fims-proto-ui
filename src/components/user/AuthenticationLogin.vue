<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRoute, useRouter } from 'vue-router'
import { KratosService, type PasswordFlow } from '@/services/kratos'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const formValue = ref<PasswordFlow>({ flowId: '', method: 'password', identifier: '', password: '', csrfToken: '' })

onMounted(async () => {
  formValue.value = (await KratosService.initLoginFlow()).data as PasswordFlow
})

async function onSubmit() {
  if (!formValue.value.flowId) {
    alert('should not happen: no flow id')
    return
  }

  const { ok, data: formResponse } = await KratosService.submitLoginFlow(formValue.value)
  if (ok) {
    userStore.action.loadUser()

    const returnTo = route.query['return_to'] as string
    if (returnTo) {
      location.replace(returnTo)
    } else {
      router.replace({ name: 'home' })
    }
    return
  }
  // otherwise, flow is returned
  formValue.value = formResponse as PasswordFlow
}
</script>

<template>
  <div class="flex h-screen w-full items-center justify-center">
    <Card class="w-full max-w-md space-y-8 px-4 py-12">
      <CardHeader>
        <CardTitle>fims</CardTitle>
        <CardDescription>{{ $t('user.loginPrompt') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit">
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <Label for="email">{{ $t('user.email') }}</Label>
              <Input
                id="email"
                v-model="formValue.identifier"
                type="email"
                placeholder="m@example.com"
                required
                autocomplete="username webauthn"
              />
            </div>
            <div class="grid gap-3">
              <Label for="password">{{ $t('user.password') }}</Label>
              <Input
                id="password"
                v-model="formValue.password"
                type="password"
                required
                autocomplete="current-password"
              />
            </div>
            <div class="flex flex-col gap-3">
              <Button type="submit" class="w-full">{{ $t('user.login') }}</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
