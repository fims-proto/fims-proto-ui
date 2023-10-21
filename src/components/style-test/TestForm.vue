<script setup lang="ts">
import { ref } from 'vue'
import { type FormRules } from '../reusable/form'
import BaseForm from '../reusable/form/BaseForm.vue'

type SelectItem = {
  value: string
  label: string
}

const editMode = ref<boolean>(true)
const labelPlacement = ref<'top' | 'left'>('left')

const modelRef = ref({
  vendor: {
    value: '001',
    label: '大内密探 001',
  },
  username: '',
  voucher: {
    headerText: '',
    attachmentNumber: 0,
  },
  normalText: 'AAA',
  emailAddress: 'BB@CC.com',
  password: 'MNDPb4OmOejNetu',
  lengthWidthHeight: [3, 4, 5],
  birthday: {
    year: 1993,
    month: 5,
    day: 14,
  },
  website: 'www.noah-ladder.top',
})

const rules: FormRules = {
  vendor: {
    required: true,
  },
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

const vendors: SelectItem[] = [
  { value: '001', label: '大内密探 001' },
  { value: '002', label: '大内密探 002' },
  { value: '003', label: '大内密探 003' },
  { value: '004', label: '大内密探 004' },
  { value: '005', label: '大内密探 005' },
  { value: '006', label: '大内密探 006' },
  { value: '007', label: '大内密探 007' },
  { value: '008', label: '大内密探 008' },
  { value: '009', label: '大内密探 009' },
]
const vendorOptions = ref<SelectItem[]>([])

const selectOptions: SelectItem[] = [
  { value: '1', label: 'John Wick' },
  { value: '2', label: 'Jason Bourne' },
  { value: '3', label: 'Eason Hunt' },
  { value: '4', label: 'James Bound' },
]

const selectedValue = ref<SelectItem>()
const selectedValues = ref<SelectItem[]>([])

const formRef = ref<InstanceType<typeof BaseForm>>()

const onVenderQueryChange = (query: string) => {
  vendorOptions.value = vendors.filter((v) => v.label.includes(query) || v.value.includes(query))
}
</script>

<template>
  <div class="space-y-8">
    <div class="rounded-lg p-4">
      <div class="flex gap-2 mb-2">
        <BaseButton @click="editMode = !editMode">{{ editMode ? 'Display' : 'Edit' }}</BaseButton>
        <BaseButton @click="formRef?.validate">Validate</BaseButton>
        <BaseButton @click="formRef?.resetValidation">Reset Validation</BaseButton>
        <BaseButton @click="labelPlacement = labelPlacement === 'top' ? 'left' : 'top'">
          Label placement: {{ labelPlacement }}
        </BaseButton>
      </div>

      <BaseForm
        ref="formRef"
        :model="modelRef"
        :rules="rules"
        :edit="editMode"
        :label-placement="labelPlacement"
        label-width="5rem"
        class="w-96 flex flex-col gap-4"
      >
        <BaseFormItem path="username" label="user name">
          <BaseInput v-model="modelRef.username" />
        </BaseFormItem>
        <BaseFormItem path="voucher.headerText" label="header text">
          <BaseInput v-model="modelRef.voucher.headerText" />
        </BaseFormItem>
        <BaseFormItem path="voucher.attachmentNumber" label="attachment number">
          <BaseInput v-model="modelRef.voucher.attachmentNumber" html-type="number" :force-integer="true" />
        </BaseFormItem>

        <BaseFormItem path="vendor" label="Vendor">
          <BaseAutocomplete
            v-model="modelRef.vendor"
            :display-value="(v) => v?.label"
            :options="vendorOptions"
            :option-key="(opt) => opt?.value"
            :display-option="(opt) => opt?.label"
            @change="onVenderQueryChange"
          />
        </BaseFormItem>

        <BaseFormItem label="主角">
          <BaseSelect
            v-model="selectedValue"
            :display-value="(v) => v?.label"
            :options="selectOptions"
            :option-key="(opt) => opt?.value"
            :display-option="(opt) => opt?.label"
          />
        </BaseFormItem>

        <BaseFormItem label="主角团">
          <BaseSelect
            v-model="selectedValues"
            :display-value="(v) => v?.label"
            :options="selectOptions"
            :option-key="(opt) => opt?.value"
            :display-option="(opt) => opt?.label"
            multiple
          />
        </BaseFormItem>

        <BaseFormItem label="没有可选项的反派">
          <BaseSelect
            v-model="selectedValues"
            :display-value="(v) => v?.label"
            :options="[]"
            :option-key="(opt) => opt?.value"
            :display-option="(opt) => opt?.label"
          />
        </BaseFormItem>

        <BaseFormItem label="普通文本">
          <BaseInput v-model="modelRef.normalText" placeholder="say something..." />
        </BaseFormItem>

        <BaseFormItem label="Email 地址" required>
          <BaseInput
            v-model="modelRef.emailAddress"
            placeholder="快输入..."
            html-type="email"
            autocomplete="email"
            required
          />
        </BaseFormItem>

        <BaseFormItem label="密码" required>
          <BaseInput
            v-model="modelRef.password"
            placeholder="快输入..."
            html-type="password"
            autocomplete="current-password"
            required
          />
        </BaseFormItem>

        <BaseFormItem label="长宽高">
          <BaseInputGroup>
            <BaseInput v-model="modelRef.lengthWidthHeight[0]" hide-label html-type="number" />
            <BaseInput v-model="modelRef.lengthWidthHeight[1]" hide-label html-type="number" />
            <BaseInput v-model="modelRef.lengthWidthHeight[2]" hide-label html-type="number" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="何年何月">
          <BaseInputGroup>
            <BaseInput v-model="modelRef.birthday.year" hide-label html-type="number" suffix="年" />
            <BaseInput v-model="modelRef.birthday.month" hide-label html-type="number" suffix="月" />
            <BaseInput v-model="modelRef.birthday.day" hide-label html-type="number" suffix="日" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="文本前后缀">
          <BaseInput v-model="modelRef.website" placeholder="fims" prefix="https://" suffix=".com" />
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

        <div v-if="editMode">
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
