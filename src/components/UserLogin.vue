<script lang="ts">
import { SubmitSelfServiceLoginFlowWithPasswordMethodBody } from "@ory/kratos-client";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Auth from "../domain/Auth";
import FlowRepository from "../domain/FlowRepository";
import { KratosFlow } from "../types";
import UserForm from "./UserForm.vue";

export default defineComponent({
  components: { UserForm },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const flow = ref<KratosFlow | undefined>()
    const error = ref<Error>()

    const getOut = () => router.push(route.query?.['redirect'] as string ?? '/')

    onMounted(async () => {
      if (await Auth.isLoggedIn()) {
        getOut()
      }
      flow.value = await FlowRepository.initLoginFlow()
    })

    const onSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }

      const result = await FlowRepository.submitLoginFlow(flow.value.id, buildJsonFromFlow(flow.value as KratosFlow))
      flow.value = result.flow ?? flow.value
      error.value = result.error

      if (!error.value) {
        Auth.setSession(result.data?.session)
        getOut()
      }
    }

    return {
      flow,
      error,
      onSubmit,
    };
  },
})

function buildJsonFromFlow(flow: KratosFlow) {
  let result = {} as SubmitSelfServiceLoginFlowWithPasswordMethodBody

  const getValue = (attr: string) => flow.ui.nodes.find(node => node.attributes.name == attr)?.attributes.value

  result.csrf_token = getValue('csrf_token')
  result.method = getValue('method')
  result.password = getValue('password')
  result.password_identifier = getValue('password_identifier')
  return result
}
</script>

<template>
  <section>
    <div class="container">
      <div v-if="error" class="messageContainer">{{ error.message }}</div>
      <div v-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
        <div v-for="message in flow.ui.messages" class="messageContainer">{{ message.text }}</div>
      </div>
      <user-form
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="flow?.ui.nodes"
        @submit="onSubmit"
      />
    </div>
  </section>
</template>

<style scoped>
section {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  width: 25rem;
}

.messageContainer {
  color: var(--danger);
}
</style>