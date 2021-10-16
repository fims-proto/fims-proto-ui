<script lang="ts">
import { SubmitSelfServiceSettingsFlowBody } from "@ory/kratos-client";
import { defineComponent, onMounted } from "@vue/runtime-core";
import { computed, ref } from "vue";
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

    const profileNodes = computed(() => {
      return filterNodes('profile', flow.value)
    })

    const passwordNodes = computed(() => {
      return filterNodes('password', flow.value)
    })

    const onProfileSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const payload = buildJsonFromFlow<SubmitSelfServiceSettingsFlowBody>(profileNodes.value, ['csrf_token', 'method', 'traits.email', 'traits.name.first', 'traits.name.last'])
      const result = await FlowRepository.submitSettingFlow(flow.value?.id, payload)

      flow.value = result.flow ?? flow.value
      error.value = result.error
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
  <section>
    <div v-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
      <div v-for="message in flow.ui.messages" class="messageContainer">{{ message.text }}</div>
    </div>
    <UserForm
      :action="flow?.ui.action"
      :method="flow?.ui.method"
      :ui-nodes="profileNodes"
      @submit="onProfileSubmit"
    />
    <UserForm
      :action="flow?.ui.action"
      :method="flow?.ui.method"
      :ui-nodes="passwordNodes"
      @submit="onPasswordSubmit"
    />
  </section>
</template>

<style scoped>
section {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: var(--dark);
}
</style>