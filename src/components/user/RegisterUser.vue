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
const passwordFormValue = ref<formModel>({ csrf_token: '', method: '', email: '', password: '', confirmPassword: '' })

const formRule: FormRules = {
  password: {
    required: true,
  },
  confirmPassword: {
    required: true,
    validator: (value) => {
      if (value !== passwordFormValue.value.password) {
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
  passwordFormValue.value = { ...buildPasswordForm(flow.value), confirmPassword: '' }
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
  passwordFormValue.value = { ...buildPasswordForm(flow.value), confirmPassword: '' }
  formBusy.value = false
  notify(flow.value)
  if (ok) {
    router.replace({ name: 'login' })
  }
}
</script>

<template>
  <!-- container -->
  <div class="w-full h-screen flex items-center justify-center bg-neutral-50">
    <!-- wrapper -->
    <div class="w-full max-w-md py-12 px-4 space-y-8">
      <!-- header -->
      <div>
        <h1 class="text-center text-3xl font-extrabold text-primary-900">Register</h1>
      </div>

      <!-- form -->
      <BaseForm
        class="flex flex-col gap-4"
        :model="passwordFormValue"
        :rules="formRule"
        :busy="formBusy"
        @submit="handleSubmit(passwordFormValue as UpdateSettingsFlowBody)"
      >
        <input v-model="passwordFormValue.csrf_token" type="hidden" />
        <BaseFormItem path="email" :label="t('user.email')">
          <BaseInput v-model="passwordFormValue.email" disabled />
        </BaseFormItem>
        <BaseFormItem path="password" :label="t('user.newPassword')">
          <BaseInput
            v-model="passwordFormValue.password"
            :placeholder="t('user.passwordInputPlaceholder')"
            html-type="password"
            autocomplete="new-password"
          />
        </BaseFormItem>
        <BaseFormItem path="confirmPassword" :label="t('user.confirmNewPassword')">
          <BaseInput
            v-model="passwordFormValue.confirmPassword"
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
    </div>
  </div>
</template>
