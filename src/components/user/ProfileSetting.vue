<script setup lang="ts">
import { type SettingsFlow, type UpdateSettingsFlowBody } from '@ory/kratos-client'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KratosService, UserService } from '../../domain'
import { useUserStore } from '../../store/user'
import { buildPasswordForm, buildProfileForm, notify, type passwordFormType, type profileFormType } from './helpers'

const { t } = useI18n()
const userStore = useUserStore()

const formBusy = ref(true)

const flow = ref<SettingsFlow | undefined>()
const profileFormValue = ref<profileFormType>({
  csrf_token: '',
  method: '',
  traits: { email: '', name: { first: '', last: '' } },
})
const passwordFormValue = ref<passwordFormType>({ csrf_token: '', method: '', email: '', password: '' })

onMounted(async () => {
  ;({ data: flow.value } = await KratosService.initSettingFlow())
  profileFormValue.value = buildProfileForm(flow.value)
  passwordFormValue.value = buildPasswordForm(flow.value)
  formBusy.value = false
  notify(flow.value)
})

const handleSubmit = async (formValue: UpdateSettingsFlowBody) => {
  formBusy.value = true
  if (!flow.value) {
    alert('should not happen: no flow id')
    return
  }

  ;({ data: flow.value } = await KratosService.submitSettingFlow(flow.value?.id, formValue))
  profileFormValue.value = buildProfileForm(flow.value)
  passwordFormValue.value = buildPasswordForm(flow.value)
  formBusy.value = false
  notify(flow.value)

  await userStore.action.loadUser()
}

const onProfileUpdate = async () => {
  await handleSubmit(profileFormValue.value as UpdateSettingsFlowBody)
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
            <BaseForm class="flex flex-col gap-4" :busy="formBusy" @submit="onProfileUpdate">
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
              <BaseButton html-type="submit" category="primary" :busy="formBusy">
                <template #icon>
                  <LockClosedMiniIcon />
                </template>
                <span>{{ t('action.submit') }}</span>
              </BaseButton>
            </BaseForm>
          </BaseTabPanel>

          <!-- password update -->
          <BaseTabPanel class="max-w-xl">
            <BaseForm
              class="flex flex-col gap-4"
              :busy="formBusy"
              @submit="handleSubmit(passwordFormValue as UpdateSettingsFlowBody)"
            >
              <input v-model="passwordFormValue.csrf_token" type="hidden" />
              <!-- hidden username field for browser autocomplete -->
              <input
                v-model="passwordFormValue.email"
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
              <BaseButton html-type="submit" category="primary" :busy="formBusy">
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
