<script lang="ts">
import { JsonError, SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody, UiNodeInputAttributes } from "@ory/kratos-client";
import { defineComponent, onMounted, ref } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { KratosService } from '../../domain';
import { useUserStore } from '../../store/user';
import { UiText } from '../../types';

interface formValueType {
  flowId: string,
  method: string,
  user: {
    email: string,
    password: string,
  },
  csrfToken: string
}

interface messageType {
  type?: 'error' | 'info' | 'success' | 'warning' | undefined,
  text: string
}

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18n()
    const userStore = useUserStore()

    const messages = ref<messageType[]>([])
    const formValue = ref<formValueType>({ flowId: '', method: '', user: { email: '', password: '', }, csrfToken: '' })
    const formBusy = ref(true)

    onMounted(async () => {
      const result = await KratosService.initLoginFlow()
      if ('error' in result) {
        messages.value = [{
          type: 'error',
          text: (result as JsonError).error.message
        }]
      } else {
        formValue.value = buildFormValue(result)
        messages.value = buildMessages(result)
      }
      formBusy.value = false
    })

    const handleSubmit = async () => {
      formBusy.value = true
      if (!formValue.value.flowId) {
        alert("should not happen: no flow id")
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

    return {
      formValue,
      formBusy,
      messages,
      handleSubmit,
      t: i18n.t
    };
  },
})

function buildFormValue(flow: SelfServiceLoginFlow): formValueType {
  const getValue = (attr: string) => (flow.ui.nodes.find(node =>
    (node.attributes as UiNodeInputAttributes).name == attr)?.attributes as UiNodeInputAttributes).value

  return {
    flowId: flow.id,
    method: getValue('method'),
    user: {
      email: getValue('password_identifier') ?? '',
      password: getValue('password') ?? '',
    },
    csrfToken: getValue('csrf_token')
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

function buildMessages(flow: SelfServiceLoginFlow): messageType[] {
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
    text: message.text
  })
  return [
    flow.ui.messages?.map(createMessage) ?? [],
    flow.ui.nodes.flatMap(node => node.messages).map(createMessage) ?? []
  ].flat()
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
      <base-alert
        v-for="message in messages"
        :type="message.type ?? 'error'"
        :message="message.text"
        closable
      />

      <!-- form -->
      <base-form
        class="px-12 py-8 bg-white shadow-lg rounded-lg"
        @submit="handleSubmit"
        hideRequiredMark
      >
        <input type="hidden" v-model="formValue.csrfToken" />
        <base-input
          :label="t('user.email')"
          :placeholder="t('user.emailInputPlaceholder')"
          v-model="formValue.user.email"
          html-type="email"
          autocomplete="email"
          required
        />
        <base-input
          :label="t('user.password')"
          :placeholder="t('user.passwordInputPlaceholder')"
          v-model="formValue.user.password"
          html-type="password"
          autocomplete="current-password"
          required
        />

        <div>
          <base-button html-type="submit" type="primary" class="w-full">
            <template #icon>
              <lock-closed-solid-icon />
            </template>
            <span>{{ t('user.login') }}</span>
          </base-button>
        </div>
      </base-form>
    </div>
  </div>
</template>
