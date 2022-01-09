<script lang="ts">
import { JsonError, SelfServiceLoginFlow, SubmitSelfServiceLoginFlowWithPasswordMethodBody, UiNodeInputAttributes } from "@ory/kratos-client";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import Kratos from "../domain/Kratos";
import KratosForm from "./KratosForm.vue";

export default defineComponent({
  components: { KratosForm },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const flow = ref<SelfServiceLoginFlow | undefined>()
    const error = ref<string>()

    onMounted(async () => {
      const result = await Kratos.initLoginFlow()
      if ('error' in result) {
        error.value = (result as JsonError).error.message
      } else {
        flow.value = result as SelfServiceLoginFlow
      }
    })

    const onSubmit = async () => {
      if (!flow.value) {
        alert("should not happen: no flow id")
        return
      }

      const result = await Kratos.submitLoginFlow(flow.value.id, buildJsonFromFlow(flow.value))
      if ('session' in result) {
        const returnTo = route.query['return_to'] as string
        if (returnTo) {
          location.href = returnTo
        } else {
          router.push({ name: 'home' })
        }
        return
      }
      // otherwise, flow is retured
      flow.value = result
    }

    return {
      flow,
      error,
      onSubmit,
    };
  },
})

function buildJsonFromFlow(flow: SelfServiceLoginFlow) {
  let result = {} as SubmitSelfServiceLoginFlowWithPasswordMethodBody

  const getValue = (attr: string) => (flow.ui.nodes.find(node =>
    (node.attributes as UiNodeInputAttributes).name == attr)?.attributes as UiNodeInputAttributes).value

  result.csrf_token = getValue('csrf_token')
  result.method = getValue('method')
  result.password = getValue('password')
  result.password_identifier = getValue('password_identifier')
  return result
}
</script>

<template>
  <section class="loggin">
    <div class="loggin__container">
      <el-alert v-if="error" type="error" :title="error" />
      <div v-else-if="flow?.ui.messages && flow?.ui.messages?.length > 0">
        <el-alert
          v-for="message in flow.ui.messages"
          :type="message.type"
          :title="message.text"
          :closable="false"
        />
      </div>
      <kratos-form
        v-if="!error"
        :action="flow?.ui.action"
        :method="flow?.ui.method"
        :ui-nodes="flow?.ui.nodes"
        @submit="onSubmit"
      />
    </div>
  </section>
</template>

<style scoped>
.loggin {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loggin__container {
  width: 25rem;
}
</style>