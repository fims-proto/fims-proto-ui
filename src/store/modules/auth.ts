export default {
  state: () => {
    return {
      user: undefined
    }
  },
  mutations: {
    setUser(state: { user: any }, user: any) {
      state.user = user
    }
  }
}