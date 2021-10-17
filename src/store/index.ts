import { createStore } from "vuex";
import authModule from "./modules/auth";
import notificationModule from "./modules/notification";

export default createStore({
  modules: {
    auth: authModule,
    notification: notificationModule
  }
})