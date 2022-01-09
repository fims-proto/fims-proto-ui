<script lang="ts">
import { SelfServiceSettingsFlow, SubmitSelfServiceSettingsFlowBody } from "@ory/kratos-client";
import { defineComponent, onMounted } from "vue";
import { computed, ref } from "vue";
import { ElNotification } from 'element-plus';
import Kratos from "../domain/Kratos";
import KratosForm from "./KratosForm.vue";

export default defineComponent({
  components: { KratosForm },
  setup() {
    const flow = ref<SelfServiceSettingsFlow | undefined>()

    onMounted(async () => {
      flow.value = await Kratos.initSettingFlow()
    })

    const profileNodes = computed(() => filterNodes('profile', flow.value))
    const passwordNodes = computed(() => filterNodes('password', flow.value))

    const onProfileSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const payload = buildJsonFromFlow<SubmitSelfServiceSettingsFlowBody>(profileNodes.value, ['csrf_token', 'method', 'traits.email', 'traits.name.first', 'traits.name.last'])
      const result = await Kratos.submitSettingFlow(flow.value?.id, payload)

      flow.value = result
      ElNotification.success({ message: 'Profile updated' })
    }

    const onPasswordSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const payload = buildJsonFromFlow<SubmitSelfServiceSettingsFlowBody>(passwordNodes.value, ['csrf_token', 'method', 'password'])
      const result = await Kratos.submitSettingFlow(flow.value?.id, payload)

      flow.value = result
      ElNotification.success({ message: 'Password updated' })
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

function filterNodes(group: string, flow: SelfServiceSettingsFlow | undefined) {
  return flow?.ui.nodes.filter(node => node.group == 'default' || node.group == group)
}

function buildJsonFromFlow<T>(uiNodes: Array<any> | undefined, requiredFields: Array<string>): T {
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
  <div class="profile-setting">
    <div class="profile-setting__container">
      <div v-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
        <el-alert
          v-for="message in flow.ui.messages"
          :type="message.type"
          :title="message.text"
          :closable="false"
        ></el-alert>
      </div>
      <kratos-form
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="profileNodes"
        @submit="onProfileSubmit"
      />
      <el-divider />
      <kratos-form
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="passwordNodes"
        @submit="onPasswordSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-setting {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-setting__container {
  width: 30rem;
}
</style>