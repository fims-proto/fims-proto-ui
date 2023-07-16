<script setup lang="ts">
import { ref } from 'vue'
import { type FormRules } from '../reusable/form'
import BaseForm from '../reusable/form/BaseForm.vue'

const modelRef = ref({
  username: '',
  voucher: {
    headerText: '',
    attachmentNumber: 0,
  },
})

const rules: FormRules = {
  username: {
    required: true,
  },
  'voucher.headerText': {
    required: true,
    validator: (value) => {
      if ((value as string).startsWith('N')) {
        return new Error('Cannot starts with "N"')
      }
      return true
    },
  },
  'voucher.attachmentNumber': {
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
  <div class="space-y-8">
    <h1 class="text-neutral-900">BaseForm validation:</h1>
    <div class="rounded-lg p-4">
      <div class="flex gap-2 mb-2">
        <BaseButton @click="formRef?.validate">Validate</BaseButton>
        <BaseButton @click="formRef?.resetValidation">Reset Validation</BaseButton>
      </div>

      <BaseForm ref="formRef" :model="modelRef" :rules="rules" class="w-96 flex flex-col gap-4">
        <BaseFormItem path="username" label="user name">
          <BaseInput v-model="modelRef.username" />
        </BaseFormItem>
        <BaseFormItem path="voucher.headerText" label="header text">
          <BaseInput v-model="modelRef.voucher.headerText" />
        </BaseFormItem>
        <BaseFormItem path="voucher.attachmentNumber" label="attachment number">
          <BaseInput v-model="modelRef.voucher.attachmentNumber" html-type="number" :force-integer="true" />
        </BaseFormItem>
      </BaseForm>
    </div>

    <h1 class="text-neutral-900">BaseForm:</h1>
    <div class="rounded-lg p-4">
      <BaseForm class="max-w-lg flex flex-col gap-4">
        <BaseFormItem label="普通文本">
          <BaseInput placeholder="say something..." />
        </BaseFormItem>

        <BaseFormItem label="Email 地址" required>
          <BaseInput placeholder="快输入..." html-type="email" autocomplete="email" required />
        </BaseFormItem>

        <BaseFormItem label="密码" required>
          <BaseInput placeholder="快输入..." html-type="password" autocomplete="current-password" required />
        </BaseFormItem>

        <BaseFormItem label="长宽高">
          <BaseInputGroup>
            <BaseInput hide-label html-type="number" />
            <BaseInput hide-label html-type="number" />
            <BaseInput hide-label html-type="number" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="何年何月">
          <BaseInputGroup>
            <BaseInput hide-label html-type="number" suffix="年" />
            <BaseInput hide-label html-type="number" suffix="月" />
            <BaseInput hide-label html-type="number" suffix="日" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="文本前后缀">
          <BaseInput placeholder="fims" prefix="https://" suffix=".com" />
        </BaseFormItem>

        <BaseFormItem label="控件前后缀_未完成">
          <BaseInput placeholder="0.00">
            <template #prefix>
              <select class="border-transparent rounded-md text-sm">
                <option>Income</option>
                <option>Outcome</option>
              </select>
            </template>
            <template #suffix>
              <select class="appearance-none border-transparent rounded-md text-sm">
                <option>USD</option>
                <option>CNY</option>
              </select>
            </template>
          </BaseInput>
        </BaseFormItem>

        <div>
          <BaseButton html-type="submit" category="primary" class="w-full">
            <template #icon>
              <LockClosedMiniIcon />
            </template>
            <span>登录</span>
          </BaseButton>
        </div>
      </BaseForm>
    </div>
  </div>
</template>
