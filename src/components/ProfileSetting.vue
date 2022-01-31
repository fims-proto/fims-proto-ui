<script lang="ts">
import { SelfServiceSettingsFlow, UiText } from "@ory/kratos-client";
import { NForm, NAlert, NFormItem, NInput, NButton, NSpin, NSpace, NTabPane, NTabs } from 'naive-ui';
import { defineComponent, onMounted } from "vue";
import { ref } from "vue";
import { useI18n } from 'vue-i18n';
import { KratosService } from '../domain';

interface profileFormType {
  csrf_token: string,
  method: string,
  traits: any
}

interface passwordFormType {
  csrf_token: string,
  method: string,
  password: string
}

interface messageType {
  type?: 'default' | 'error' | 'info' | 'success' | 'warning' | undefined,
  text: string
}

export default defineComponent({
  components: { NForm, NAlert, NFormItem, NInput, NButton, NSpin, NSpace, NTabs, NTabPane },
  setup() {
    const i18n = useI18n()
    const messages = ref<messageType[]>([])
    const flow = ref<SelfServiceSettingsFlow | undefined>()
    const profileFormRef = ref<any>(null)
    const passwordFormRef = ref<any>(null)
    const formBusy = ref(true)
    const profileFormValue = ref<profileFormType>({ csrf_token: '', method: '', traits: { email: '', name: { first: '', last: '' } } })
    const passwordFormValue = ref<passwordFormType>({ csrf_token: '', method: '', password: '' })

    onMounted(async () => {
      flow.value = await KratosService.initSettingFlow()
      profileFormValue.value = buildProfileForm(filterNodes('profile', flow.value))
      passwordFormValue.value = buildPasswordForm(filterNodes('password', flow.value))
      messages.value = buildMessages(flow.value)
      formBusy.value = false
    })

    const handleSubmit = async (formValue: any) => {
      formBusy.value = true
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }

      flow.value = await KratosService.submitSettingFlow(flow.value?.id, formValue)
      profileFormValue.value = buildProfileForm(filterNodes('profile', flow.value))
      passwordFormValue.value = buildPasswordForm(filterNodes('password', flow.value))
      messages.value = buildMessages(flow.value)
      formBusy.value = false
    }

    return {
      profileFormRef,
      passwordFormRef,
      formBusy,
      messages,
      profileFormValue,
      passwordFormValue,
      t: i18n.t,
      onProfileSubmit() {
        profileFormRef.value?.validate((errors: any) => {
          if (!errors) {
            handleSubmit(profileFormValue.value)
          }
        })
      },
      onPasswordSubmit() {
        passwordFormRef.value?.validate((errors: any) => {
          if (!errors) {
            handleSubmit(passwordFormValue.value)
          }
        })
      },
      profileFormRule: {
        traits: {
          email: {
            required: true,
            message: i18n.t('user.emailValidateMessage'),
            trigger: ['input', 'blur']
          }
        }
      },
      passwordFormRule: {
        password: {
          required: true,
          message: i18n.t('user.passwordValidateMessage'),
          trigger: ['input', 'blur']
        }
      }
    }
  }
})

function filterNodes(group: string, flow: SelfServiceSettingsFlow | undefined) {
  return flow?.ui.nodes.filter(node => node.group == 'default' || node.group == group)
}

function getValue(attr: string, uiNodes: any[] | undefined) {
  return uiNodes?.find(node => node.attributes.name == attr)?.attributes.value
}

function buildProfileForm(uiNodes: any[] | undefined) {
  return {
    csrf_token: getValue('csrf_token', uiNodes),
    method: getValue('method', uiNodes),
    traits: {
      email: getValue('traits.email', uiNodes) ?? '',
      name: {
        first: getValue('traits.name.first', uiNodes) ?? '',
        last: getValue('traits.name.last', uiNodes) ?? '',
      }
    }
  }
}

function buildPasswordForm(uiNodes: any[] | undefined) {
  return {
    csrf_token: getValue('csrf_token', uiNodes),
    method: getValue('method', uiNodes),
    password: getValue('password', uiNodes) ?? ''
  }
}

function buildMessages(flow: SelfServiceSettingsFlow | undefined): messageType[] {
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
    flow?.ui.messages?.map(createMessage) ?? [],
    flow?.ui.nodes.flatMap(node => node.messages).map(createMessage) ?? []
  ].flat()
}
</script>

<template>
  <div class="profile-setting">
    <div class="profile-setting__container">
      <n-spin :show="formBusy">
        <n-space vertical>
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

          <n-tabs default-value="profile">
            <n-tab-pane name="profile" :tab="t('user.updateProfile')">
              <n-form ref="profileFormRef" :model="profileFormValue" :rules="profileFormRule">
                <input type="hidden" v-model="profileFormValue.csrf_token" />
                <n-form-item :label="t('user.email')" path="traits.email">
                  <n-input
                    v-model:value="profileFormValue.traits.email"
                    :placeholder="t('user.emailInputPlaceholder')"
                  />
                </n-form-item>
                <n-form-item :label="t('user.lastname')" path="traits.name.last">
                  <n-input
                    v-model:value="profileFormValue.traits.name.last"
                    :placeholder="t('user.lastnameInputPlaceholder')"
                  />
                </n-form-item>
                <n-form-item :label="t('user.firstname')" path="traits.name.first">
                  <n-input
                    v-model:value="profileFormValue.traits.name.first"
                    :placeholder="t('user.firstnameInputPlaceholder')"
                  />
                </n-form-item>
                <n-form-item>
                  <n-button
                    type="primary"
                    @click.prevent="onProfileSubmit"
                    class="profile-setting__container__form-submit"
                    attr-type="button"
                  >{{ t('action.submit') }}</n-button>
                </n-form-item>
              </n-form>
            </n-tab-pane>
            <n-tab-pane name="password" :tab="t('user.updatePassword')">
              <n-form ref="passwordFormRef" :model="passwordFormValue" :rules="passwordFormRule">
                <input type="hidden" v-model="passwordFormValue.csrf_token" />
                <n-form-item :label="t('user.password')" path="password">
                  <n-input
                    type="password"
                    v-model:value="passwordFormValue.password"
                    :placeholder="t('user.passwordInputPlaceholder')"
                  />
                </n-form-item>
                <n-form-item>
                  <n-button
                    type="primary"
                    @click.prevent="onPasswordSubmit"
                    class="profile-setting__container__form-submit"
                    attr-type="button"
                  >{{ t('action.submit') }}</n-button>
                </n-form-item>
              </n-form>
            </n-tab-pane>
          </n-tabs>
        </n-space>
      </n-spin>
    </div>
  </div>
</template>

<style scoped>
.profile-setting__container {
  width: 30rem;
}

.profile-setting__container__form-submit {
  width: 100%;
}
</style>