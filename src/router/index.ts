import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { Auth } from '../domain/auth';
import Login from "../components/Login.vue";
import Layout from "../components/Layout.vue";
import BaseInput from '../components/BaseInput.vue'
import About from '../components/About.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		component: Login,
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

router.beforeEach((to) => {
	if (to.meta.requiresAuth && !Auth.isLoggedIn()) {
		return {
			path: '/login',
			// save the location we were at to come back later
			query: { redirect: to.fullPath },
		}
	}
})

export default router