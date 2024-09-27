<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { KratosService, type PasswordFlow } from '../../domain'
import { useUserStore } from '../../store/user'
import { AppForm, AppLabel, type FormItemState, type FormRules } from '../reusable/form'

const { t } = useI18n()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const formValue = ref<PasswordFlow>({ flowId: '', method: 'password', identifier: '', password: '', csrfToken: '' })
const itemState = ref<FormItemState>({})
const formRules: FormRules = {
  identifier: {
    required: true,
  },
  password: {
    required: true,
  },
}

onMounted(async () => {
  formValue.value = (await KratosService.initLoginFlow()).data as PasswordFlow
})

const onSubmit = async () => {
  if (!formValue.value.flowId) {
    alert('should not happen: no flow id')
    return
  }

  const { ok, data } = await KratosService.submitLoginFlow(formValue.value)
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
  // otherwise, flow is retured
  formValue.value = data as PasswordFlow
}
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center">
    <!-- wrapper -->
    <div class="w-full max-w-md py-12 px-4 space-y-8">
      <!-- header -->
      <div>
        <h1 class="text-center text-3xl font-extrabold">Login</h1>
      </div>

      <!-- form -->
      <Card>
        <template #content>
          <AppForm
            class="flex flex-col gap-4"
            :model="formValue"
            :rules="formRules"
            @submit="onSubmit"
            @item-state-change="(newState: FormItemState) => (itemState = newState)"
          >
            <AppLabel for="email-input">{{ t('user.email') }}</AppLabel>
            <InputText
              id="email-input"
              v-model="formValue.identifier"
              :placeholder="t('user.emailInputPlaceholder')"
              :invalid="itemState['identifier']?.invalid"
              aria-describedby="email-help"
              class="w-full"
            />
            <small v-if="itemState['identifier']?.message" id="email-help">
              {{ t(itemState['identifier'].message) }}
            </small>

            <AppLabel for="password-input">{{ t('user.password') }}</AppLabel>
            <InputText
              id="password-input"
              v-model="formValue.password"
              type="password"
              :placeholder="t('user.passwordInputPlaceholder')"
              :invalid="itemState['password']?.invalid"
              aria-describedby="password-help"
              class="w-full"
            />
            <small v-if="itemState['password']?.message" id="password-help">
              {{ t(itemState['password'].message) }}
            </small>

            <Button :label="t('user.login')" icon="pi pi-lock" type="submit" />
          </AppForm>
        </template>
      </Card>
    </div>
  </div>
</template>
