<script lang="ts">
import { defineComponent, PropType } from "vue";
import { UiNode } from "../types";

export default defineComponent({
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

  <el-form v-else label-position="top" @submit.prevent="onSubmit">
    <template v-for="node in uiNodes" :key="node.attributes.name">
      <div v-if="node.type == 'input'">
        <div v-if="node.messages && node.messages?.length > 0" class="sign">
          <el-alert
            v-for="message in node.messages"
            :type="message.type"
            :title="message.text"
            :closable="false"
          ></el-alert>
        </div>

        <input
          v-if="node.attributes.type === 'hidden'"
          :name="node.attributes.name"
          :type="node.attributes.type"
          :required="node.attributes.required"
          :disabled="node.attributes.disabled"
          v-model="node.attributes.value"
        />

        <el-form-item
          :label="node.meta.label.text"
          v-else-if="node.attributes.type != 'submit' && node.meta.label"
        >
          <el-input
            v-if="node.attributes.type != 'submit'"
            :name="node.attributes.name"
            :type="node.attributes.type"
            :required="node.attributes.required"
            :disabled="node.attributes.disabled"
            v-model="node.attributes.value"
          ></el-input>
        </el-form-item>
        <el-form-item v-else>
          <el-button
            class="user-form__button--submit"
            :name="node.attributes.name"
            type="primary"
            @click="onSubmit"
          >{{ node.meta.label?.text }}</el-button>
        </el-form-item>
      </div>
      <span v-else>Not supported type: {{ node.type }}</span>
    </template>
  </el-form>
</template>

<style scoped>
.user-form__button--submit {
  width: 100%;
}
</style>