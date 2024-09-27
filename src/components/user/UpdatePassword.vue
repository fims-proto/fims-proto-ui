<script setup lang="ts">
import type { SettingsFlow, UpdateSettingsFlowBody } from '@ory/kratos-client'
import { onMounted, ref } from 'vue'
import { KratosService } from '../../domain'
import { buildPasswordForm, notify, type passwordFormType } from './helpers'
import { useI18n } from 'vue-i18n'
import type { FormRules } from '../reusable/form'
import { useRouter } from 'vue-router'
import { goHome } from '../../router'

const { t } = useI18n()
const router = useRouter()

interface formModel extends passwordFormType {
  confirmPassword: string
}

const formBusy = ref(true)
const flow = ref<SettingsFlow | undefined>()
const passwordForm = ref<formModel>({ csrf_token: '', method: '', email: '', password: '', confirmPassword: '' })

const formRule: FormRules = {
  password: {
    required: true,
  },
  confirmPassword: {
    required: true,
    validator: (value) => {
      if (value !== passwordForm.value.password) {
        return Error('user.passwordNotSame')
      }
      return true
    },
  },
}

onMounted(async () => {
  const { ok, data } = await KratosService.initSettingFlow()
  if (!ok) {
    console.warn('cannot initiate setting flow, redirect to home page')
    goHome()
    return
  }

  flow.value = data
  passwordForm.value = { ...buildPasswordForm(flow.value), confirmPassword: '' }
  formBusy.value = false
  notify(flow.value)
})

const handleSubmit = async (formValue: UpdateSettingsFlowBody) => {
  if (!flow.value) {
    alert('should not happen: no flow id')
    return
  }

  formBusy.value = true
  const { ok, data } = await KratosService.submitSettingFlow(flow.value?.id, formValue)
  flow.value = data
  passwordForm.value = { ...buildPasswordForm(flow.value), confirmPassword: '' }
  formBusy.value = false
  notify(flow.value)
  if (ok) {
    router.replace({ name: 'login' })
  }
}
</script>

<template>
  <!-- form -->
  <BaseForm
    :model="passwordForm"
    :rules="formRule"
    :busy="formBusy"
    class="flex flex-col gap-4"
    @submit="handleSubmit(passwordForm as UpdateSettingsFlowBody)"
  >
    <input v-model="passwordForm.csrf_token" type="hidden" />
    <BaseFormItem path="email" :label="t('user.email')">
      <BaseInput v-model="passwordForm.email" disabled />
    </BaseFormItem>
    <BaseFormItem path="password" :label="t('user.newPassword')" required>
      <BaseInput
        v-model="passwordForm.password"
        :placeholder="t('user.passwordInputPlaceholder')"
        html-type="password"
        autocomplete="new-password"
      />
    </BaseFormItem>
    <BaseFormItem path="confirmPassword" :label="t('user.confirmNewPassword')" required>
      <BaseInput
        v-model="passwordForm.confirmPassword"
        :placeholder="t('user.confirmPasswordInputPlaceholder')"
        html-type="password"
        autocomplete="new-password"
      />
    </BaseFormItem>
    <BaseButton class="w-full" html-type="submit" category="primary" :busy="formBusy">
      <template #icon>
        <LockClosedMiniIcon />
      </template>
      <span>{{ t('action.submit') }}</span>
    </BaseButton>
  </BaseForm>
</template>
