import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';
import AuthenticationLogin from '../components/AuthenticationLogin.vue';
import AuthenticationLogout from '../components/AuthenticationLogout.vue';
import ProfileSetting from '../components/ProfileSetting.vue';
import Layout from '../components/Layout.vue';
import Home from '../components/Home.vue';
import About from '../components/About.vue';
import NotFound from '../components/NotFound.vue';
import SobMain from '../components/SobMain.vue';
import SobDetail from '../components/SobDetail.vue';
import SobCreation from '../components/SobCreation.vue';
import VoucherMain from '../components/VoucherMain.vue';
import VoucherCreation from '../components/VoucherCreation.vue';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/ui',
		component: Layout,
		children: [
			{
				path: '',
				name: 'home',
				component: Home
			},
			{
				path: 'about',
				name: 'about',
				component: About
			},
			{
				path: 'profile/settings',
				component: ProfileSetting,
			},
			{
				path: 'sobs',
				component: RouterView,
				children: [
					{
						path: '',
						name: 'sobMain',
						component: SobMain
					},
					{
						path: 'new',
						name: 'sobCreation',
						component: SobCreation
					},
					{
						path: ':sobId',
						component: RouterView,
						children: [
							{
								path: '',
								name: 'sobDetail',
								component: SobDetail
							},
							{
								path: 'vouchers',
								component: RouterView,
								children: [
									{
										path: '',
										name: 'voucherMain',
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
		path: '/authentication',
		component: RouterView,
		children: [
			{
				path: 'login',
				component: AuthenticationLogin
			},
			{
				path: 'logout',
				component: AuthenticationLogout
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

export default router