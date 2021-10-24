import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';
import Auth from '../domain/Auth';
import Layout from '../components/Layout.vue';
import Home from '../components/Home.vue';
import About from '../components/About.vue';
import UserLogin from '../components/UserLogin.vue';
import UserLoggedOut from '../components/UserLoggedOut.vue';
import UserMain from '../components/UserMain.vue';
import UserSetting from '../components/UserSetting.vue';
import NotFound from '../components/NotFound.vue';
import SobMain from '../components/SobMain.vue';
import SobDetail from '../components/SobDetail.vue';
import SobCreation from '../components/SobCreation.vue';
import VoucherMain from '../components/VoucherMain.vue';
import VoucherCreation from '../components/VoucherCreation.vue';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'userLogin',
		component: UserLogin,
	},
	{
		path: '/loggedOut',
		name: 'userLogout',
		component: UserLoggedOut,
	},
	{
		path: '/',
		name: 'home',
		component: Layout,
		meta: { requiresAuth: true },
		children: [
			{
				path: '',
				component: Home
			},
			{
				path: 'about',
				name: 'about',
				component: About
			},
			{
				path: 'user',
				name: 'user',
				component: RouterView,
				children: [
					{
						path: '',
						name: 'userMain',
						component: UserMain
					},
					{
						path: 'settings',
						name: 'userSettings',
						component: UserSetting
					}
				]
			},
			{
				path: 'sobs',
				name: 'sobMain',
				component: RouterView,
				children: [
					{
						path: '',
						component: SobMain
					},
					{
						path: 'new',
						name: 'sobCreation',
						component: SobCreation
					},
					{
						path: ':sobId',
						name: 'sobDetail',
						component: RouterView,
						children: [
							{
								path: '',
								component: SobDetail
							},
							{
								path: 'vouchers',
								name: 'voucherMain',
								component: RouterView,
								children: [
									{
										path: '',
										component: VoucherMain
									},
									{
										path: 'new',
										name: 'voucherCreation',
										component: VoucherCreation
									}
								]
							}
						]
					}
				]
			}
		]
	},
	{
		path: '/:pathMatch(.*)*',
		component: NotFound
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