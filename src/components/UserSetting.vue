<script lang="ts">
import { SubmitSelfServiceSettingsFlowBody } from "@ory/kratos-client";
import { defineComponent, onMounted } from "@vue/runtime-core";
import { computed, ref } from "vue";
import { ElNotification } from 'element-plus';
import Auth from "../domain/Auth";
import FlowRepository from "../domain/FlowRepository";
import { KratosFlow, UiNode } from "../types";
import UserForm from "./UserForm.vue";

export default defineComponent({
  components: { UserForm },
  setup() {
    const flow = ref<KratosFlow | undefined>()
    const error = ref<Error>()

    onMounted(async () => {
      flow.value = await FlowRepository.initSettingFlow()
    })

    const profileNodes = computed(() => filterNodes('profile', flow.value))
    const passwordNodes = computed(() => filterNodes('password', flow.value))

    const onProfileSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const payload = buildJsonFromFlow<SubmitSelfServiceSettingsFlowBody>(profileNodes.value, ['csrf_token', 'method', 'traits.email', 'traits.name.first', 'traits.name.last'])
      const result = await FlowRepository.submitSettingFlow(flow.value?.id, payload)

      flow.value = result.flow ?? flow.value
      error.value = result.error

      if (result.success) {
        Auth.setUser(result.data?.identity)
        ElNotification.success({ message: 'Profile updated' })
      }
    }

    const onPasswordSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const payload = buildJsonFromFlow<SubmitSelfServiceSettingsFlowBody>(passwordNodes.value, ['csrf_token', 'method', 'password'])
      const result = await FlowRepository.submitSettingFlow(flow.value?.id, payload)

      flow.value = result.flow ?? flow.value
      error.value = result.error

      if (result.success) {
        Auth.setUser(result.data?.identity)
        ElNotification.success({ message: 'Password updated' })
      }
    }

    return {
      flow,
      profileNodes,
      passwordNodes,
      onProfileSubmit,
      onPasswordSubmit
    }
  }
})

function filterNodes(group: string, flow: KratosFlow | undefined) {
  return flow?.ui.nodes.filter(node => node.group == 'default' || node.group == group)
}

function buildJsonFromFlow<T>(uiNodes: Array<UiNode> | undefined, requiredFields: Array<string>): T {
  let result: Record<string, any> = {}

  if (!uiNodes || !uiNodes.length) {
    return result as T
  }

  const getValue = (attr: string) => uiNodes.find(node => node.attributes.name == attr)?.attributes.value

  requiredFields.forEach(field => {
    result[field] = getValue(field)
  })
  return result as T
}
</script>

<template>
  <div class="user-setting">
    <div class="user-setting__container">
      <div v-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
        <el-alert
          v-for="message in flow.ui.messages"
          :type="message.type"
          :title="message.text"
          :closable="false"
        ></el-alert>
      </div>
      <user-form
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="profileNodes"
        @submit="onProfileSubmit"
      />
      <el-divider />
      <user-form
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="passwordNodes"
        @submit="onPasswordSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.user-setting {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-setting__container {
  width: 30rem;
}
</style>