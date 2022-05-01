import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';
import AuthenticationLogin from '../components/user/AuthenticationLogin.vue';
import AuthenticationLogout from '../components/user/AuthenticationLogout.vue';
import ProfileSetting from '../components/user/ProfileSetting.vue';
import Layout from '../components/Layout.vue';
import Home from '../components/Home.vue';
import About from '../components/About.vue';
import NotFound from '../components/NotFound.vue';
import SobMain from '../components/sob/SobMain.vue';
import SobDetail from '../components/sob/SobDetail.vue';
import SobCreation from '../components/sob/SobCreation.vue';
import LedgerMain from '../components/legder/LedgerMain.vue';
import LedgerList from '../components/legder/LedgerList.vue';
import VoucherMain from '../components/VoucherMain.vue';
import VoucherCreation from '../components/VoucherCreation.vue';
import Exception from '../components/Exception.vue';
import StyleTest from '../components/StyleTest.vue';
import { useSobStore } from '../store/sob';

const sobStore = useSobStore()

const routes: RouteRecordRaw[] = [
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
				name: 'profile',
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
						beforeEnter: async to => sobStore.action.setWorkingSob(to.params['sobId'] as string),
						children: [
							{
								path: '',
								name: 'sobDetail',
								component: SobDetail
							},
							{
								path: 'periods',
								component: RouterView,
								children: [
									{
										path: '',
										name: 'ledgerMain',
										component: LedgerMain,
										children: [
											{
												path: ':periodId',
												name: 'ledgerList',
												component: LedgerList
											}
										]
									}
								]
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
		path: '/styleTest',
		component: StyleTest
	},
	{
		path: '/error',
		name: 'exception',
		component: Exception
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

router.onError((error, to, from) => {
	router.push({ name: 'exception' })
})

export default router