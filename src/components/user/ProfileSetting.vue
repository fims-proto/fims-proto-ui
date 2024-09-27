<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KratosService, UserService, type ProfileFlow } from '../../domain'
import { useUserStore } from '../../store/user'
import { AppForm, AppLabel } from '../reusable/form'
import UpdatePassword from './UpdatePassword.vue'

const { t } = useI18n()
const userStore = useUserStore()

const formValue = ref<ProfileFlow>({
  flowId: '',
  method: 'profile',
  email: '',
  name: { first: '', last: '' },
  csrfToken: '',
})

onMounted(async () => {
  formValue.value = (await KratosService.initProfileSettingFlow()).data as ProfileFlow
})

const onProfileUpdate = async () => {
  if (!formValue.value.flowId) {
    alert('should not happen: no flow id')
    return
  }

  const { ok, data } = await KratosService.submitProfileSettingFlow(formValue.value)
  if (ok) {
    await userStore.action.loadUser()
    UserService.updateUser(userStore.state.user.id, userStore.state.user.traits)
  }
  formValue.value = data as ProfileFlow
}
</script>

<template>
  <Tabs value="0" lazy>
    <TabList>
      <Tab value="0">{{ t('profile.updateProfile') }}</Tab>
      <Tab value="1">{{ t('profile.updatePassword') }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <!-- profile update -->
        <AppForm class="flex flex-col gap-4" :model="formValue" @submit="onProfileUpdate">
          <AppLabel for="email-input">{{ t('user.email') }}</AppLabel>
          <InputText id="email-input" v-model="formValue.email" class="w-full" />

          <AppLabel for="lastname-input">{{ t('user.lastname') }}</AppLabel>
          <InputText id="lastname-input" v-model="formValue.name.last" class="w-full" />

          <AppLabel for="firstname-input">{{ t('user.firstname') }}</AppLabel>
          <InputText id="firstname-input" v-model="formValue.name.first" class="w-full" />

          <Button :label="t('action.submit')" icon="pi pi-lock" type="submit" />
        </AppForm>
      </TabPanel>
      <TabPanel value="1">
        <UpdatePassword />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
