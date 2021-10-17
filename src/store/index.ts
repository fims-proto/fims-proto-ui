import { createStore } from "vuex";
import authModule from "./modules/auth";
import notifierModule from "./modules/notifier";

export default createStore({
  modules: {
    auth: authModule,
    notifier: notifierModule
  }
})