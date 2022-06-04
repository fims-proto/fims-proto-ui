<script setup lang="ts">
import { SelfServiceSettingsFlow, SubmitSelfServiceSettingsFlowBody } from '@ory/kratos-client'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KratosService, UiNode, UiText } from '../../domain'
import { useNotificationStore } from '../../store/notification'
import { useUserStore } from '../../store/user'

const { t } = useI18n()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const formBusy = ref(true)
const messages = ref<messageType[]>([])

const flow = ref<SelfServiceSettingsFlow | undefined>()
const profileFormValue = ref<profileFormType>({
  csrf_token: '',
  method: '',
  traits: { email: '', name: { first: '', last: '' } },
})
const passwordFormValue = ref<passwordFormType>({ csrf_token: '', method: '', password: '' })

onMounted(async () => {
  flow.value = await KratosService.initSettingFlow()
  profileFormValue.value = buildProfileForm(filterNodes('profile', flow.value) as UiNode[])
  passwordFormValue.value = buildPasswordForm(filterNodes('password', flow.value) as UiNode[])
  messages.value = buildMessages(flow.value)
  formBusy.value = false
})

const handleSubmit = async (formValue: SubmitSelfServiceSettingsFlowBody) => {
  formBusy.value = true
  if (!flow.value) {
    notificationStore.action.push({
      type: 'error',
      message: 'should not happen: no flow id',
      duration: 0,
    })
    return
  }

  flow.value = await KratosService.submitSettingFlow(flow.value?.id, formValue)
  profileFormValue.value = buildProfileForm(filterNodes('profile', flow.value) as UiNode[])
  passwordFormValue.value = buildPasswordForm(filterNodes('password', flow.value) as UiNode[])
  messages.value = buildMessages(flow.value)
  formBusy.value = false

  userStore.action.loadUser()
}
</script>

<script lang="ts">
interface profileFormType {
  csrf_token: string
  method: string
  traits: {
    email: string
    name: {
      first: string
      last: string
    }
  }
}

interface passwordFormType {
  csrf_token: string
  method: string
  password: string
}

interface messageType {
  type?: 'error' | 'info' | 'success' | 'warning' | undefined
  text: string
}

function filterNodes(group: string, flow: SelfServiceSettingsFlow | undefined) {
  return flow?.ui.nodes.filter((node) => node.group == 'default' || node.group == group)
}

function getValue(attr: string, uiNodes: UiNode[] | undefined) {
  return uiNodes?.find((node) => node.attributes.name == attr)?.attributes.value
}

function buildProfileForm(uiNodes: UiNode[] | undefined) {
  return {
    csrf_token: getValue('csrf_token', uiNodes) ?? '',
    method: getValue('method', uiNodes) ?? '',
    traits: {
      email: getValue('traits.email', uiNodes) ?? '',
      name: {
        first: getValue('traits.name.first', uiNodes) ?? '',
        last: getValue('traits.name.last', uiNodes) ?? '',
      },
    },
  }
}

function buildPasswordForm(uiNodes: UiNode[] | undefined) {
  return {
    csrf_token: getValue('csrf_token', uiNodes) ?? '',
    method: getValue('method', uiNodes) ?? '',
    password: getValue('password', uiNodes) ?? '',
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
    text: message.text,
  })
  return [
    flow?.ui.messages?.map(createMessage) ?? [],
    flow?.ui.nodes.flatMap((node) => node.messages).map(createMessage) ?? [],
  ].flat()
}
</script>

<template>
  <base-page :subtitle="t('profile.subtitle')">
    <template #title>{{ t('profile.title') }}</template>
    <div class="flex flex-col gap-2">
      <base-notification
        v-for="(message, i) in messages"
        :key="`profileUpdate-alert-${i}`"
        :type="message.type ?? 'error'"
        :message="message.text"
      />

      <base-tabs>
        <template #tabs>
          <base-tab-item>{{ t('profile.updateProfile') }}</base-tab-item>
          <base-tab-item>{{ t('profile.updatePassword') }}</base-tab-item>
        </template>
        <template #panels>
          <!-- profile update -->
          <base-tab-panel class="max-w-xl">
            <base-form @submit="handleSubmit(profileFormValue)">
              <input v-model="profileFormValue.csrf_token" type="hidden" />
              <base-form-item :label="t('user.email')" required>
                <base-input
                  v-model="profileFormValue.traits.email"
                  :placeholder="t('user.emailInputPlaceholder')"
                  type="email"
                  autocomplete="email"
                  required
                />
              </base-form-item>
              <base-form-item :label="t('user.lastname')">
                <base-input
                  v-model="profileFormValue.traits.name.last"
                  :placeholder="t('user.lastnameInputPlaceholder')"
                />
              </base-form-item>
              <base-form-item :label="t('user.lastname')">
                <base-input
                  v-model="profileFormValue.traits.name.first"
                  :placeholder="t('user.firstnameInputPlaceholder')"
                />
              </base-form-item>
              <div>
                <base-button type="submit" category="primary" class="w-full">
                  <template #icon>
                    <lock-closed-solid-icon />
                  </template>
                  <span>{{ t('action.submit') }}</span>
                </base-button>
              </div>
            </base-form>
          </base-tab-panel>

          <!-- password update -->
          <base-tab-panel class="max-w-xl">
            <base-form @submit="handleSubmit(passwordFormValue)">
              <input v-model="passwordFormValue.csrf_token" type="hidden" />
              <!-- hidden username field for browser autocomplete -->
              <input
                v-model="profileFormValue.traits.email"
                type="text"
                name="email"
                autocomplete="email"
                style="display: none"
              />
              <base-form-item :label="t('user.password')" required>
                <base-input
                  v-model="passwordFormValue.password"
                  :placeholder="t('user.passwordInputPlaceholder')"
                  type="password"
                  autocomplete="new-password"
                  required
                />
              </base-form-item>
              <div>
                <base-button type="submit" category="primary" class="w-full">
                  <template #icon>
                    <lock-closed-solid-icon />
                  </template>
                  <span>{{ t('action.submit') }}</span>
                </base-button>
              </div>
            </base-form>
          </base-tab-panel>
        </template>
      </base-tabs>
    </div>
  </base-page>
</template>
