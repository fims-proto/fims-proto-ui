export default {
  state: () => {
    return {
      messages: []
    }
  },
  mutations: {
    push(state: { messages: Array<any> }, message: any) {
      state.messages.push(message)
    },

    remove(state: { messages: Array<any> }, messageId: string) {
      state.messages = state.messages.filter(message => message.id != messageId)
    }
  }
}