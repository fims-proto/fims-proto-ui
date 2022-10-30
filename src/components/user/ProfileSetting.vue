<script setup lang="ts">
import { SelfServiceSettingsFlow, SubmitSelfServiceSettingsFlowBody } from '@ory/kratos-client'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KratosService, UiNode, UiText, UserService } from '../../domain'
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

  await userStore.action.loadUser()
}

const onProfileUpdate = async () => {
  await handleSubmit(profileFormValue.value)
  UserService.updateUser(userStore.state.userId, userStore.state.traits)
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
  <BasePage :subtitle="t('profile.subtitle')">
    <template #title>{{ t('profile.title') }}</template>
    <div class="flex flex-col gap-2">
      <BaseNotification
        v-for="(message, i) in messages"
        :key="`profileUpdate-alert-${i}`"
        :type="message.type ?? 'error'"
        :message="message.text"
      />

      <BaseTabs>
        <template #tabs>
          <BaseTabItem>{{ t('profile.updateProfile') }}</BaseTabItem>
          <BaseTabItem>{{ t('profile.updatePassword') }}</BaseTabItem>
        </template>
        <template #panels>
          <!-- profile update -->
          <BaseTabPanel class="max-w-xl">
            <BaseForm class="flex flex-col gap-4" @submit="onProfileUpdate">
              <input v-model="profileFormValue.csrf_token" type="hidden" />
              <BaseFormItem :label="t('user.email')" required>
                <BaseInput
                  v-model="profileFormValue.traits.email"
                  :placeholder="t('user.emailInputPlaceholder')"
                  html-type="email"
                  autocomplete="email"
                  required
                />
              </BaseFormItem>
              <BaseFormItem :label="t('user.lastname')">
                <BaseInput
                  v-model="profileFormValue.traits.name.last"
                  :placeholder="t('user.lastnameInputPlaceholder')"
                />
              </BaseFormItem>
              <BaseFormItem :label="t('user.firstname')">
                <BaseInput
                  v-model="profileFormValue.traits.name.first"
                  :placeholder="t('user.firstnameInputPlaceholder')"
                />
              </BaseFormItem>
              <BaseButton html-type="submit" category="primary">
                <template #icon>
                  <LockClosedMiniIcon />
                </template>
                <span>{{ t('action.submit') }}</span>
              </BaseButton>
            </BaseForm>
          </BaseTabPanel>

          <!-- password update -->
          <BaseTabPanel class="max-w-xl">
            <BaseForm class="flex flex-col gap-4" @submit="handleSubmit(passwordFormValue)">
              <input v-model="passwordFormValue.csrf_token" type="hidden" />
              <!-- hidden username field for browser autocomplete -->
              <input
                v-model="profileFormValue.traits.email"
                type="text"
                name="email"
                autocomplete="email"
                style="display: none"
              />
              <BaseFormItem :label="t('user.password')" required>
                <BaseInput
                  v-model="passwordFormValue.password"
                  :placeholder="t('user.passwordInputPlaceholder')"
                  html-type="password"
                  autocomplete="new-password"
                  required
                />
              </BaseFormItem>
              <BaseButton html-type="submit" category="primary">
                <template #icon>
                  <LockClosedMiniIcon />
                </template>
                <span>{{ t('action.submit') }}</span>
              </BaseButton>
            </BaseForm>
          </BaseTabPanel>
        </template>
      </BaseTabs>
    </div>
  </BasePage>
</template>
