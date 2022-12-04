<script lang="ts">
interface formValueType {
  flowId: string
  method: string
  user: {
    email: string
    password: string
  }
  csrfToken: string
}

interface messageType {
  type?: 'error' | 'info' | 'success' | 'warning' | undefined
  text: string
}

function buildFormValue(flow: LoginFlow): formValueType {
  const getValue = (attr: string) =>
    (
      flow.ui.nodes.find((node) => (node.attributes as UiNodeInputAttributes).name == attr)
        ?.attributes as UiNodeInputAttributes
    ).value

  return {
    flowId: flow.id,
    method: getValue('method'),
    user: {
      email: getValue('identifier') ?? '',
      password: getValue('password') ?? '',
    },
    csrfToken: getValue('csrf_token'),
  }
}

function buildSumitForm(formValue: formValueType) {
  let result = {} as SubmitSelfServiceLoginFlowWithPasswordMethodBody
  result.csrf_token = formValue.csrfToken
  result.method = formValue.method
  result.password = formValue.user.password
  result.password_identifier = formValue.user.email
  return result
}

function buildMessages(flow: LoginFlow): messageType[] {
  const convertMessageType = (type: string) => {
    switch (type) {
      case 'error':
      case 'info':
      case 'success':
      case 'warning':
        return type
      default:
        return undefined
    }
  }
  const createMessage = (message: UiText) => ({
    type: convertMessageType(message.type),
    text: message.text,
  })
  return [
    flow.ui.messages?.map(createMessage) ?? [],
    flow.ui.nodes.flatMap((node) => node.messages).map(createMessage) ?? [],
  ].flat()
}
</script>

<script setup lang="ts">
import {
  LoginFlow,
  UiNodeInputAttributes,
  SubmitSelfServiceLoginFlowWithPasswordMethodBody,
  UiText,
  JsonError,
} from '@ory/kratos-client'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { KratosService } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useUserStore } from '../../store/user'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const messages = ref<messageType[]>([])
const formValue = ref<formValueType>({ flowId: '', method: '', user: { email: '', password: '' }, csrfToken: '' })
const formBusy = ref(true)

onMounted(async () => {
  const result = await KratosService.initLoginFlow()
  if ('error' in result) {
    messages.value = [
      {
        type: 'error',
        text: (result as unknown as JsonError).error.message,
      },
    ]
  } else {
    formValue.value = buildFormValue(result)
    messages.value = buildMessages(result)
  }
  formBusy.value = false
})

const handleSubmit = async () => {
  formBusy.value = true
  if (!formValue.value.flowId) {
    notificationStore.action.push({
      type: 'error',
      message: 'should not happen: no flow id',
      duration: 0,
    })
    return
  }

  const result = await KratosService.submitLoginFlow(formValue.value.flowId, buildSumitForm(formValue.value))
  if ('session' in result) {
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
  formValue.value = buildFormValue(result)
  messages.value = buildMessages(result)
  formBusy.value = false
}
</script>

<template>
  <!-- container -->
  <div class="w-full h-screen flex items-center justify-center bg-neutral-50">
    <!-- wrapper -->
    <div class="w-full max-w-md py-12 px-4 space-y-8">
      <!-- header -->
      <div>
        <h1 class="text-center text-3xl font-extrabold text-primary-900">Login</h1>
      </div>

      <!-- messages -->
      <BaseNotification
        v-for="(message, i) in messages"
        :key="`login-alert-${i}`"
        :type="message.type ?? 'error'"
        :message="message.text"
        closable
      />

      <!-- form -->
      <BaseForm class="flex flex-col gap-4 px-12 py-8 bg-white shadow-lg rounded-lg" @submit="handleSubmit">
        <input v-model="formValue.csrfToken" type="hidden" />
        <BaseFormItem :label="t('user.email')" required>
          <BaseInput
            v-model="formValue.user.email"
            :placeholder="t('user.emailInputPlaceholder')"
            html-type="email"
            autocomplete="email"
            required
          />
        </BaseFormItem>

        <BaseFormItem :label="t('user.password')" required>
          <BaseInput
            v-model="formValue.user.password"
            :placeholder="t('user.passwordInputPlaceholder')"
            html-type="password"
            autocomplete="current-password"
            required
          />
        </BaseFormItem>

        <div>
          <BaseButton html-type="submit" category="primary" class="w-full">
            <template #icon>
              <LockClosedMiniIcon />
            </template>
            <span>{{ t('user.login') }}</span>
          </BaseButton>
        </div>
      </BaseForm>
    </div>
  </div>
</template>
