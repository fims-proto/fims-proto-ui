<script lang="ts">
import { JsonError, SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody, UiNodeInputAttributes } from "@ory/kratos-client";
import { NAlert, NButton, NForm, NFormItem, NH1, NInput, NSpace, NSpin, NText } from 'naive-ui';
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
  type?: 'default' | 'error' | 'info' | 'success' | 'warning' | undefined,
  text: string
}

export default defineComponent({
  components: { NForm, NAlert, NFormItem, NInput, NButton, NSpin, NSpace, NH1, NText },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18n()
    const userStore = useUserStore()

    const messages = ref<messageType[]>([])

    const formRef = ref<any>(null)
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
      formRef,
      formValue,
      formBusy,
      messages,
      t: i18n.t,
      rules: {
        user: {
          email: {
            required: true,
            message: i18n.t('user.emailValidateMessage'),
            trigger: ['input', 'blur']
          },
          password: {
            required: true,
            message: i18n.t('user.passwordValidateMessage'),
            trigger: ['input', 'blur']
          }
        }
      },
      onSubmitClick() {
        formRef.value?.validate((errors: any) => {
          if (!errors) {
            handleSubmit()
          }
        })
      }
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
      case 'default':
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
      <n-spin :show="formBusy">
        <n-space vertical>
          <n-h1 align-text>
            <n-text type="primary">LOGIN</n-text>
          </n-h1>

          <div v-if="messages.length > 0">
            <n-space vertical>
              <n-alert
                v-for="message in messages"
                :type="message.type ?? 'error'"
                :title="message.text"
                :show-icon="false"
              />
            </n-space>
          </div>
          <n-form ref="formRef" :model="formValue" :rules="rules">
            <input type="hidden" v-model="formValue.csrfToken" />
            <n-form-item :label="t('user.email')" path="user.email">
              <n-input
                v-model:value="formValue.user.email"
                :placeholder="t('user.emailInputPlaceholder')"
              />
            </n-form-item>
            <n-form-item :label="t('user.password')" path="user.password">
              <n-input
                type="password"
                v-model:value="formValue.user.password"
                :placeholder="t('user.passwordInputPlaceholder')"
              />
            </n-form-item>
            <n-form-item>
              <n-button
                type="primary"
                @click.prevent="onSubmitClick"
                class="loggin__container__form-submit"
                attr-type="button"
              >{{ t('action.submit') }}</n-button>
            </n-form-item>
          </n-form>
        </n-space>
      </n-spin>
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