<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { UiNode } from "../types";
import BaseInput from "./BaseInput.vue";

export default defineComponent({
  components: { BaseInput },
  props: {
    action: String,
    method: String,
    uiNodes: Object as PropType<Array<UiNode>>
  },
  emits: {
    submit: null
  },
  setup(_, { emit }) {
    const onSubmit = () => {
      emit('submit')
    }
    return {
      onSubmit
    }
  }
})
</script>

<template>
  <div v-if="!uiNodes">Loading ...</div>

  <form v-else :action="action" :method="method" @submit.prevent="onSubmit">
    <template v-for="node in uiNodes" :key="node.attributes.name">
      <div v-if="node.type == 'input'" class="formLine">
        <div v-if="node.messages && node.messages?.length > 0">
          <div v-for="message in node.messages" class="messageContainer">{{ message.text }}</div>
        </div>
        <label
          v-if="node.attributes.type != 'submit' && node.meta.label"
          :for="node.attributes.name"
        >{{ node.meta.label.text }}</label>
        <BaseInput
          v-if="node.attributes.type != 'submit'"
          :name="node.attributes.name"
          :type="node.attributes.type"
          :required="node.attributes.required"
          :disabled="node.attributes.disabled"
          v-model="node.attributes.value"
        ></BaseInput>
        <BaseInput
          v-else
          :name="node.attributes.name"
          :type="node.attributes.type"
          :required="node.attributes.required"
          :disabled="node.attributes.disabled"
          :value="node.meta.label?.text"
        ></BaseInput>
      </div>
      <span v-else>Not supported type: {{ node.type }}</span>
    </template>
  </form>
</template>

<style scoped>
.formLine {
  padding-bottom: 1rem;
}

.formLine label {
  display: block;
}

.formLine input {
  width: 100%;
  padding: 0.3rem 0.5rem;
}

.formLine input[type="submit"] {
  width: 100%;
  background-color: var(--dark);
  color: var(--light);
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  margin-top: 1rem;
  border-radius: 0.3rem;
  transition: all 0.5s ease;
}

.formLine input[type="submit"]:hover {
  opacity: 0.8;
}
</style>