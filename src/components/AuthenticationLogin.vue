<script lang="ts">
import { JsonError, SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody, UiNodeInputAttributes } from "@ory/kratos-client";
import { defineComponent, onMounted, ref } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { KratosService } from '../domain';
import { useUserStore } from '../store/user';
import { UiText } from '../types';

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
          location.href = returnTo
        } else {
          router.push({ name: 'home' })
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
  <section class="loggin">
    <div class="loggin__container">
      <a-spin :spinning="formBusy">
        <a-space direction="vertical" style="width: 100%;">
          <a-typography-title>LOGIN</a-typography-title>

          <div v-if="messages.length > 0">
            <a-space direction="vertical">
              <a-alert
                v-for="message in messages"
                :type="message.type ?? 'error'"
                :message="message.text"
              />
            </a-space>
          </div>
          <a-form :model="formValue" layout="vertical" hideRequiredMark @finish="handleSubmit">
            <input type="hidden" v-model="formValue.csrfToken" />
            <a-form-item
              :label="t('user.email')"
              :name="['user', 'email']"
              :rules="[{ required: true, message: t('user.emailValidateMessage') }]"
            >
              <a-input
                v-model:value="formValue.user.email"
                :placeholder="t('user.emailInputPlaceholder')"
                autocomplete="username email"
              />
            </a-form-item>
            <a-form-item
              :label="t('user.password')"
              :name="['user', 'password']"
              :rules="[{ required: true, message: t('user.passwordValidateMessage') }]"
            >
              <a-input
                type="password"
                v-model:value="formValue.user.password"
                :placeholder="t('user.passwordInputPlaceholder')"
                autocomplete="current-password"
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                class="loggin__container__form-submit"
              >{{ t('action.submit') }}</a-button>
            </a-form-item>
          </a-form>
        </a-space>
      </a-spin>
    </div>
  </section>
</template>

<style scoped>
.loggin {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loggin__container {
  width: 25rem;
}

.loggin__container__form-submit {
  width: 100%;
}
</style>