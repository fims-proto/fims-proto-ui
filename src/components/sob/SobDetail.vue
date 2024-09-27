<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { type Sob } from '../../domain'
import SobEdit from './SobEdit.vue'
import AccountList from './AccountList.vue'
import AuxiliaryMain from './AuxiliaryMain.vue'

defineProps<{
  sobId: string
  view?: string
}>()

const { t } = useI18n()

const sob = ref<Sob>()
const editMode = ref(false)
</script>

<template>
  <div>
    <h1>{{ sob?.name }}</h1>
    <Tabs value="0" lazy>
      <TabList>
        <Tab value="0">{{ t('sob.detail.basic') }}</Tab>
        <Tab value="1">{{ t('sob.detail.accounts') }}</Tab>
        <Tab value="2">{{ t('sob.detail.auxiliaries') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <Button :disabled="editMode" :label="t('action.edit')" @click="editMode = true" />
          <Button v-if="editMode" :label="t('action.save')" @click="editMode = false" />
          <Button v-if="editMode" text :label="t('action.cancel')" @click="editMode = false" />

          <SobEdit :sob-id="sobId" :edit-mode="editMode ? 'update' : 'display'" />
        </TabPanel>
        <TabPanel value="1">
          <AccountList :sob-id="sobId" />
        </TabPanel>
        <TabPanel value="2">
          <AuxiliaryMain :sob-id="sobId" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
