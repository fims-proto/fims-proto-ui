<script setup lang="ts">
import { type SettingsFlow, type UpdateSettingsFlowBody } from '@ory/kratos-client'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KratosService, UserService } from '../../domain'
import { useUserStore } from '../../store/user'
import { buildProfileForm, notify, type profileFormType } from './helpers'
import type { FormRules } from '../reusable/form'

const { t } = useI18n()
const userStore = useUserStore()

const flow = ref<SettingsFlow | undefined>()
const profileForm = ref<profileFormType>({
  csrf_token: '',
  method: '',
  traits: { email: '', name: { first: '', last: '' } },
})
const formRule: FormRules = {
  'traits.email': {
    required: true,
  },
}
const formBusy = ref(true)

onMounted(async () => {
  ;({ data: flow.value } = await KratosService.initSettingFlow())
  profileForm.value = buildProfileForm(flow.value)
  formBusy.value = false
  notify(flow.value)
})

const onProfileUpdate = async () => {
  formBusy.value = true
  if (!flow.value) {
    alert('should not happen: no flow id')
    return
  }

  ;({ data: flow.value } = await KratosService.submitSettingFlow(
    flow.value?.id,
    profileForm.value as UpdateSettingsFlowBody,
  ))
  profileForm.value = buildProfileForm(flow.value)
  formBusy.value = false
  notify(flow.value)

  await userStore.action.loadUser()
  UserService.updateUser(userStore.state.user.id, userStore.state.user.traits)
}
</script>

<template>
  <BasePage :subtitle="t('profile.subtitle')">
    <template #title>{{ t('profile.title') }}</template>
    <div class="flex flex-col gap-2">
      <BaseTabs>
        <template #tabs>
          <BaseTabItem>{{ t('profile.updateProfile') }}</BaseTabItem>
          <BaseTabItem>{{ t('profile.updatePassword') }}</BaseTabItem>
        </template>
        <template #panels>
          <!-- profile update -->
          <BaseTabPanel class="max-w-xl">
            <BaseForm
              :model="profileForm"
              :rules="formRule"
              :busy="formBusy"
              class="flex flex-col gap-4"
              @submit="onProfileUpdate"
            >
              <input v-model="profileForm.csrf_token" type="hidden" />
              <BaseFormItem :label="t('user.email')" path="traits.email" required>
                <BaseInput
                  v-model="profileForm.traits.email"
                  :placeholder="t('user.emailInputPlaceholder')"
                  html-type="email"
                  autocomplete="email"
                  required
                />
              </BaseFormItem>
              <BaseFormItem :label="t('user.lastname')" path="traits.name.last">
                <BaseInput v-model="profileForm.traits.name.last" :placeholder="t('user.lastnameInputPlaceholder')" />
              </BaseFormItem>
              <BaseFormItem :label="t('user.firstname')" path="traits.name.first">
                <BaseInput v-model="profileForm.traits.name.first" :placeholder="t('user.firstnameInputPlaceholder')" />
              </BaseFormItem>
              <BaseButton class="w-full" html-type="submit" category="primary" :busy="formBusy">
                <template #icon>
                  <LockClosedMiniIcon />
                </template>
                <span>{{ t('action.submit') }}</span>
              </BaseButton>
            </BaseForm>
          </BaseTabPanel>

          <!-- password update -->
          <BaseTabPanel class="max-w-xl">
            <UpdatePassword />
          </BaseTabPanel>
        </template>
      </BaseTabs>
    </div>
  </BasePage>
</template>
