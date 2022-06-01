import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router'
import AuthenticationLogin from '../components/user/AuthenticationLogin.vue'
import AuthenticationLogout from '../components/user/AuthenticationLogout.vue'
import ProfileSetting from '../components/user/ProfileSetting.vue'
import LayoutPage from '../components/LayoutPage.vue'
import HomePage from '../components/HomePage.vue'
import AboutUs from '../components/AboutUs.vue'
import NotFound from '../components/NotFound.vue'
import SobMain from '../components/sob/SobMain.vue'
import SobDetail from '../components/sob/SobDetail.vue'
import SobCreation from '../components/sob/SobCreation.vue'
import LedgerMain from '../components/legder/LedgerMain.vue'
import LedgerList from '../components/legder/LedgerList.vue'
import VoucherMain from '../components/voucher/VoucherMain.vue'
import VoucherCreation from '../components/voucher/VoucherCreation.vue'
import VoucherDetail from '../components/voucher/VoucherDetail.vue'
import ExceptionPage from '../components/ExceptionPage.vue'
import StyleTest from '../components/StyleTest.vue'
import { useSobStore } from '../store/sob'

const sobStore = useSobStore()

const routes: RouteRecordRaw[] = [
  {
    path: '/ui',
    component: LayoutPage,
    children: [
      // home
      {
        path: '',
        name: 'home',
        component: HomePage,
      },
      // about
      {
        path: 'about',
        name: 'about',
        component: AboutUs,
      },
      // profile
      {
        path: 'profile/settings',
        name: 'profile',
        component: ProfileSetting,
      },
      // sobs
      {
        path: 'sobs',
        component: RouterView,
        children: [
          {
            path: '',
            name: 'sobMain',
            component: SobMain,
          },
          {
            path: 'new',
            name: 'sobCreation',
            component: SobCreation,
          },
          {
            path: ':sobId',
            name: 'sobDetail',
            component: SobDetail,
            props: true,
          },
        ],
      },
      // ledgers
      {
        path: 'sobs/:sobId/periods',
        component: RouterView,
        props: true,
        beforeEnter: async (to) => sobStore.action.setWorkingSob(to.params['sobId'] as string),
        children: [
          {
            path: '',
            name: 'ledgerMain',
            component: LedgerMain,
            children: [
              {
                path: ':periodId',
                name: 'ledgerList',
                component: LedgerList,
                props: true,
              },
            ],
          },
        ],
      },
      // vouchers
      {
        path: 'sobs/:sobId/vouchers',
        component: RouterView,
        props: true,
        beforeEnter: async (to) => sobStore.action.setWorkingSob(to.params['sobId'] as string),
        children: [
          {
            path: '',
            name: 'voucherMain',
            component: VoucherMain,
          },
          {
            path: 'new',
            name: 'voucherCreation',
            component: VoucherCreation,
          },
          {
            path: ':voucherId',
            name: 'voucherDetail',
            component: VoucherDetail,
          },
        ],
      },
    ],
  },
  {
    path: '/authentication',
    component: RouterView,
    children: [
      {
        path: 'login',
        component: AuthenticationLogin,
      },
      {
        path: 'logout',
        component: AuthenticationLogout,
      },
    ],
  },
  {
    path: '/styleTest',
    component: StyleTest,
  },
  {
    path: '/error',
    name: 'exception',
    component: ExceptionPage,
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.onError((...args) => {
  console.log(args)
  router.push({ name: 'exception' })
})

export default router
