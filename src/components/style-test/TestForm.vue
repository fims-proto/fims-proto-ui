<script setup lang="ts">
import { ref } from 'vue'
import { FormRules } from '../reusable/form'
import BaseForm from '../reusable/form/BaseForm.vue'

const modelRef = ref({
  username: '',
  journal: {
    headerText: '',
    attachmentNumber: 0,
  },
})

const rules: FormRules = {
  username: {
    required: true,
  },
  'journal.headerText': {
    required: true,
    validator: (value) => {
      if ((value as string).startsWith('N')) {
        return new Error('Cannot starts with "N"')
      }
      return true
    },
  },
  'journal.attachmentNumber': {
    validator: (value) => {
      if (Number(value) < 0) {
        return new Error('Cannot be negetive')
      }
      return true
    },
  },
}

const formRef = ref<InstanceType<typeof BaseForm>>()
</script>

<template>
  <div class="flex gap-2 mb-2">
    <BaseButton @click="formRef?.validate">Validate</BaseButton>
    <BaseButton @click="formRef?.resetValidation">Reset Validation</BaseButton>
  </div>

  <BaseForm ref="formRef" :model="modelRef" :rules="rules" class="w-96 flex flex-col gap-4">
    <BaseFormItem path="username" label="user name">
      <BaseInput v-model="modelRef.username" />
    </BaseFormItem>
    <BaseFormItem path="journal.headerText" label="header text">
      <BaseInput v-model="modelRef.journal.headerText" />
    </BaseFormItem>
    <BaseFormItem path="journal.attachmentNumber" label="attachment number">
      <BaseInput v-model="modelRef.journal.attachmentNumber" html-type="number" />
    </BaseFormItem>
  </BaseForm>
</template>
