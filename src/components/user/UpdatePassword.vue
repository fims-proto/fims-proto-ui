<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { goHome } from '../../router'
import { AppForm, AppLabel } from '../reusable/form'
import { KratosService, type PasswordFlow } from '@domain/kratos'
import { useToastStore } from '@store/toast'

const { t } = useI18n()
const router = useRouter()
const toast = useToastStore()

type FormModel = PasswordFlow & {
  confirmPassword: string
}

const formValue = ref<FormModel>({
  flowId: '',
  method: 'password',
  identifier: '',
  password: '',
  confirmPassword: '',
  csrfToken: '',
})

onMounted(async () => {
  const { ok, data } = await KratosService.initPasswordSettingFlow()
  if (!ok) {
    console.warn('Cannot initiate setting flow, redirect to home page')
    goHome()
    return
  }

  formValue.value = { ...(data as PasswordFlow), confirmPassword: '' }
})

const onSubmit = async () => {
  if (!formValue.value.flowId) {
    alert('should not happen: no flow id')
    return
  }

  if (formValue.value.confirmPassword !== formValue.value.password) {
    toast.action.add({ severity: 'error', detail: t('user.passwordNotSame') })
    return
  }

  const { ok, data } = await KratosService.submitPasswordSettingFlow(formValue.value)
  if (ok) {
    router.replace({ name: 'login' })
    return
  }
  formValue.value = { ...(data as PasswordFlow), confirmPassword: '' }
}
</script>

<template>
  <!-- form -->
  <AppForm class="flex flex-col gap-4" :model="formValue" @submit="onSubmit">
    <AppLabel for="email-input">{{ t('user.email') }}</AppLabel>
    <InputText id="email-input" v-model="formValue.identifier" disabled class="w-full" />

    <AppLabel for="password-input">{{ t('user.newPassword') }}</AppLabel>
    <InputText
      id="password-input"
      v-model="formValue.password"
      type="password"
      :placeholder="t('user.passwordInputPlaceholder')"
      autocomplete="new-password"
      class="w-full"
    />

    <AppLabel for="confirm-password-input">{{ t('user.confirmNewPassword') }}</AppLabel>
    <InputText
      id="confirm-password-input"
      v-model="formValue.confirmPassword"
      type="password"
      :placeholder="t('user.confirmPasswordInputPlaceholder')"
      autocomplete="new-password"
      class="w-full"
    />

    <Button :label="t('action.submit')" icon="pi pi-lock" type="submit" />
  </AppForm>
</template>
