<script setup lang="ts">
import { onMounted } from 'vue'
import z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'

import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { KratosService, type ProfileFlow } from '@/services/kratos'
import { useUserStore } from '@/store/user'
import { UserService } from '@/services/user'

const userStore = useUserStore()

const formSchema = toTypedSchema(
  z.object({
    flowId: z.string(),
    method: z.literal('profile'),
    email: z.string().email(),
    name: z.object({ first: z.string(), last: z.string() }),
    csrfToken: z.string(),
  }),
)

const form = useForm({
  validationSchema: formSchema,
})

onMounted(async () => {
  form.resetForm({ values: (await KratosService.initProfileSettingFlow()).data as ProfileFlow }, { force: true })
})

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  const { ok, data: flowResponse } = await KratosService.submitProfileSettingFlow(values as ProfileFlow)
  if (ok) {
    await userStore.action.loadUser()
    UserService.updateUser(userStore.state.user.id, userStore.state.user.traits)
  }
  resetForm({ values: flowResponse as ProfileFlow })
})
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <VeeField v-slot="{ componentField, errorMessage }" name="email">
      <Field>
        <FieldLabel for="email">{{ $t('user.email') }}</FieldLabel>
        <Input id="email" type="email" autocomplete="username" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <VeeField v-slot="{ componentField, errorMessage }" name="name.last">
      <Field>
        <FieldLabel for="lastname">{{ $t('user.lastname') }}</FieldLabel>
        <Input id="lastname" type="text" autocomplete="family-name" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <VeeField v-slot="{ componentField, errorMessage }" name="name.first">
      <Field>
        <FieldLabel for="firstname">{{ $t('user.firstname') }}</FieldLabel>
        <Input id="firstname" type="text" autocomplete="given-name" v-bind="componentField" />
        <FieldError>{{ errorMessage }}</FieldError>
      </Field>
    </VeeField>

    <div class="flex justify-end pt-2">
      <Button type="submit">{{ $t('action.save') }}</Button>
    </div>
  </form>
</template>
