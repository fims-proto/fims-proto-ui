import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Auth from '../domain/Auth';
import Layout from "../components/Layout.vue";
import BaseInput from '../components/BaseInput.vue'
import About from '../components/About.vue'
import UserLogin from "../components/UserLogin.vue";
import UserLoggedOut from "../components/UserLoggedOut.vue";
import UserSetting from '../components/UserSetting.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		component: UserLogin,
	},
	{
		path: '/user/loggedOut',
		component: UserLoggedOut,
	},
	{
		path: '/user',
		component: Layout,
		meta: { requiresAuth: true },
		children: [{
			path: 'settings',
			component: UserSetting,
		}]
	},
	{
		path: '/',
		component: Layout,
		meta: { requiresAuth: true },
		children: [{
			path: '',
			component: BaseInput
		}]
	},
	{
		path: '/about',
		component: Layout,
		meta: { requiresAuth: true },
		children: [
			{
				path: '',
				component: About
			}
		]
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach(async (to) => {
	if (to.meta.requiresAuth && !await Auth.isLoggedIn()) {
		return {
			path: '/login',
			// save the location we were at to come back later
			query: { redirect: to.fullPath },
		}
	}
})

export default router