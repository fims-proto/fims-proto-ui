<script lang="ts">
import { SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody, UiNode, UiNodeInputAttributes } from "@ory/kratos-client";
import { computed, defineComponent, onMounted, ref } from "vue";
import { FlowRepository } from "../domain/auth";
import BaseInput from "./BaseInput.vue";

export default defineComponent({
  components: { BaseInput },
  setup() {
    const flow = ref<SelfServiceLoginFlow | undefined>()
    const error = ref<Error>()

    const groupedNodes = computed(() => {
      return groupNodes(flow.value)
    })

    onMounted(async () => {
      flow.value = await FlowRepository.initLoginFlow()
    })

    const onSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }
      const formData = buildJsonFromFlow(flow.value as SelfServiceLoginFlow)
      const result = await FlowRepository.submitLoginFlow(flow.value.id, formData)
      flow.value = result.flow ?? flow.value
      error.value = result.error
    }

    return {
      flow,
      error,
      groupedNodes,
      onSubmit,
    };
  },
})

function groupNodes(flow: SelfServiceLoginFlow | undefined): Map<string, Array<UiNode>> {
  const groupMap = new Map<string, Array<UiNode>>()
  if (!flow) {
    return groupMap
  }
  for (const node of flow.ui.nodes) {
    groupMap.has(node.group) ? groupMap.get(node.group)?.push(node) : groupMap.set(node.group, [node])
  }
  return groupMap
}

function buildJsonFromFlow(flow: SelfServiceLoginFlow) {
  let result = {} as SubmitSelfServiceLoginFlowWithPasswordMethodBody

  const getValue = (attr: string) =>
    (flow.ui.nodes.find(node => (node.attributes as UiNodeInputAttributes).name == attr)?.attributes as UiNodeInputAttributes).value

  result.csrf_token = getValue('csrf_token')
  result.method = getValue('method')
  result.password = getValue('password')
  result.password_identifier = getValue('password_identifier')
  return result
}
</script>

<template>
  <section>
    <form :action="flow?.ui.action" :method="flow?.ui.method" @submit.prevent="onSubmit">
      <span class="formTitle">Login</span>

      <div v-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
        <div v-for="message in flow.ui.messages" class="messageContainer">{{ message.text }}</div>
      </div>
      <div v-if="error" class="messageContainer">{{ error.message }}</div>

      <div v-for="group in groupedNodes" :key="group[0]" class="formGroup" :class="group[0]">
        <template v-for="node in group[1]" :key="node.attributes.name">
          <div v-if="node.type == 'input'" class="formLine">
            <label
              v-if="(node.attributes as UiNodeInputAttributes).type != 'submit' && node.meta.label"
              :for="(node.attributes as UiNodeInputAttributes).name"
            >{{ node.meta.label.text }}</label>
            <BaseInput
              v-if="(node.attributes as UiNodeInputAttributes).type != 'submit'"
              :name="(node.attributes as UiNodeInputAttributes).name"
              :type="(node.attributes as UiNodeInputAttributes).type"
              :required="(node.attributes as UiNodeInputAttributes).required"
              :disabled="(node.attributes as UiNodeInputAttributes).disabled"
              v-model="(node.attributes as UiNodeInputAttributes).value"
            ></BaseInput>
            <button v-else type="submit">Sign In</button>
          </div>
          <span v-else>Not supported type: {{ node.type }}</span>
        </template>
      </div>
    </form>
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

form {
  width: 25rem;
  border: 1px var(--gray-300) solid;
  border-radius: 0.5rem;
  padding: 2rem 5rem;
  box-shadow: 2px 3px 5px 5px var(--gray-300);
}

.messageContainer {
  color: var(--danger);
}

.formTitle {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 2rem;
  font-weight: bolder;
  margin: 2rem 0;
}

.formLine {
  padding-bottom: 1rem;
}

.formLine label {
  display: block;
  margin-right: 1rem;
}

.formLine input {
  display: block;
  width: 100%;
}

.formLine button[type="submit"] {
  width: 100%;
  background-color: var(--dark);
  color: var(--light);
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  margin-top: 2rem;
  border-radius: 0.3rem;
  transition: all 0.5s ease;
}

.formLine button[type="submit"]:hover {
  opacity: 0.8;
}
</style>