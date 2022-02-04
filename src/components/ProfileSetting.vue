<script lang="ts">
import { SelfServiceSettingsFlow, UiText } from "@ory/kratos-client";
import { defineComponent, onMounted } from "vue";
import { ref } from "vue";
import { useI18n } from 'vue-i18n';
import { KratosService } from '../domain';
import { useUserStore } from '../store/user';

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
  type?: 'error' | 'info' | 'success' | 'warning' | undefined,
  text: string
}

export default defineComponent({
  setup() {
    const t = useI18n().t
    const userStore = useUserStore()

    const messages = ref<messageType[]>([])
    const flow = ref<SelfServiceSettingsFlow | undefined>()
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

      userStore.action.loadUser()
    }

    return {
      t,
      activeKey: ref('profile'),
      formBusy,
      messages,
      profileFormValue,
      passwordFormValue,
      onProfileSubmit() {
        handleSubmit(profileFormValue.value)
      },
      onPasswordSubmit() {
        handleSubmit(passwordFormValue.value)
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
  <base-page :subtitle="t('profile.subtitle')">
    <template #title>{{ t('profile.title') }}</template>
    <a-spin :spinning="formBusy">
      <a-space direction="vertical" style="width: 100%;">
        <div v-if="messages.length > 0">
          <a-space>
            <a-alert
              v-for="message in messages"
              :type="message.type ?? 'error'"
              :message="message.text"
            />
          </a-space>
        </div>

        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="profile" :tab="t('profile.updateProfile')">
            <a-form
              :model="profileFormValue"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="max-width: 40rem;"
              @finish="onProfileSubmit"
            >
              <input type="hidden" v-model="profileFormValue.csrf_token" />
              <a-form-item
                :label="t('user.email')"
                :name="['traits', 'email']"
                :rules="[{ required: true, message: t('user.emailValidateMessage') }]"
              >
                <a-input
                  v-model:value="profileFormValue.traits.email"
                  :placeholder="t('user.emailInputPlaceholder')"
                />
              </a-form-item>
              <a-form-item :label="t('user.lastname')" :name="['traits', 'name', 'last']">
                <a-input
                  v-model:value="profileFormValue.traits.name.last"
                  :placeholder="t('user.lastnameInputPlaceholder')"
                />
              </a-form-item>
              <a-form-item :label="t('user.firstname')" :name="['traits', 'name', 'first']">
                <a-input
                  v-model:value="profileFormValue.traits.name.first"
                  :placeholder="t('user.firstnameInputPlaceholder')"
                />
              </a-form-item>
              <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" html-type="submit">{{ t('action.submit') }}</a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="password" :tab="t('profile.updatePassword')">
            <a-form
              :model="passwordFormValue"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              style="max-width: 40rem;"
              @finish="onPasswordSubmit"
            >
              <input type="hidden" v-model="passwordFormValue.csrf_token" />
              <!-- hidden username field for browser autocomplete -->
              <input
                type="text"
                name="email"
                v-model="profileFormValue.traits.email"
                autocomplete="username email"
                style="display: none;"
              />
              <a-form-item
                :label="t('user.password')"
                name="password"
                :rules="[{ required: true, message: t('user.passwordValidateMessage') }]"
              >
                <a-input
                  type="password"
                  v-model:value="passwordFormValue.password"
                  :placeholder="t('user.passwordInputPlaceholder')"
                  autocomplete="new-password"
                />
              </a-form-item>
              <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" html-type="submit">{{ t('action.submit') }}</a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-space>
    </a-spin>
  </base-page>
</template>