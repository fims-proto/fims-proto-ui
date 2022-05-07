<script lang="ts">
import { SelfServiceSettingsFlow, UiText } from "@ory/kratos-client";
import { defineComponent, onMounted } from "vue";
import { ref } from "vue";
import { useI18n } from 'vue-i18n';
import { KratosService } from '../../domain';
import { useUserStore } from '../../store/user';

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
    <div class="flex flex-col gap-2">
      <base-alert v-for="(message, i) in messages" :key="`profileUpdate-alert-${i}`" :type="message.type ?? 'error'"
        :message="message.text" />

      <base-tabs>
        <template #tabs>
          <base-tab-item>{{ t('profile.updateProfile') }}</base-tab-item>
          <base-tab-item>{{ t('profile.updatePassword') }}</base-tab-item>
        </template>
        <template #panels>
          <!-- profile update -->
          <base-tab-panel class="max-w-xl">
            <base-form @submit="onProfileSubmit">
              <input type="hidden" v-model="profileFormValue.csrf_token" />
              <base-input :label="t('user.email')" :placeholder="t('user.emailInputPlaceholder')"
                v-model="profileFormValue.traits.email" type="email" autocomplete="email" required />
              <base-input :label="t('user.lastname')" :placeholder="t('user.lastnameInputPlaceholder')"
                v-model="profileFormValue.traits.name.last" />
              <base-input :label="t('user.lastname')" :placeholder="t('user.firstnameInputPlaceholder')"
                v-model="profileFormValue.traits.name.first" />
              <div>
                <base-button type="submit" categoty="primary" class="w-full">
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
            <base-form @submit="onPasswordSubmit">
              <input type="hidden" v-model="passwordFormValue.csrf_token" />
              <!-- hidden username field for browser autocomplete -->
              <input type="text" name="email" v-model="profileFormValue.traits.email" autocomplete="email"
                style="display: none;" />
              <base-input :label="t('user.password')" :placeholder="t('user.passwordInputPlaceholder')"
                v-model="passwordFormValue.password" type="password" autocomplete="new-password" required />
              <div>
                <base-button type="submit" categoty="primary" class="w-full">
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