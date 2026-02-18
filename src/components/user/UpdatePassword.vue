<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'
import z from 'zod'

import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { KratosService, type PasswordFlow } from '@/services/kratos'

const { t } = useI18n()
const router = useRouter()

const formSchema = toTypedSchema(
  z
    .object({
      flowId: z.string(),
      method: z.literal('password'),
      identifier: z.string().email(),
      password: z.string(),
      confirmPassword: z.string(),
      csrfToken: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('user.passwordNotSame'),
      path: ['confirmPassword'],
    }),
)

const form = useForm({
  validationSchema: formSchema,
})

onMounted(async () => {
  form.resetForm(
    {
      values: { ...((await KratosService.initPasswordSettingFlow()).data as PasswordFlow), confirmPassword: '' },
    },
    { force: true },
  )
})

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  const { ok, data: flowResponse } = await KratosService.submitPasswordSettingFlow(values as PasswordFlow)
  if (ok) {
    router.replace({ name: 'login' })
    return
  }
  resetForm({
    values: { ...(flowResponse as PasswordFlow), confirmPassword: '' },
  })
})
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <VeeField v-slot="{ componentField, errorMessage }" name="identifier">
      <Field>
        <FieldLabel for="identifier">{{ t('user.email') }}</FieldLabel>
        <Input id="identifier" type="email" disabled autocomplete="username" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <VeeField v-slot="{ componentField, errorMessage }" name="password">
      <Field>
        <FieldLabel for="password">{{ t('user.newPassword') }}</FieldLabel>
        <Input id="password" type="password" required autocomplete="new-password" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <VeeField v-slot="{ componentField, errorMessage }" name="confirmPassword">
      <Field>
        <FieldLabel for="confirmPassword">{{ t('user.confirmNewPassword') }}</FieldLabel>
        <Input id="confirmPassword" type="password" required autocomplete="new-password" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <div class="flex justify-end pt-2">
      <Button type="submit">{{ t('action.submit') }}</Button>
    </div>
  </form>
</template>
