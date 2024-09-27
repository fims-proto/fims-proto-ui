import { createRouter, createWebHistory, type RouteRecordRaw, RouterView } from 'vue-router'
import { verifyCurrentUser, loadWorkingSob, updateWorkingSob, verifyNotLoggedIn } from './before-enter-handlers'
import NotImplemented from '../components/NotImplemented.vue'
import AppLayout from '../components/AppLayout.vue'
import AuthenticationLogin from '../components/user/AuthenticationLogin.vue'
import AuthenticationLogout from '../components/user/AuthenticationLogout.vue'
import ProfileSetting from '../components/user/ProfileSetting.vue'
import RegisterUser from '../components/user/RegisterUser.vue'
import SobMain from '../components/sob/SobMain.vue'
import SobEdit from '../components/sob/SobEdit.vue'
import SobDetail from '../components/sob/SobDetail.vue'
import LedgerInitialize from '../components/sob/LedgerInitialize.vue'
import VoucherMain from '../components/voucher/VoucherMain.vue'
import VoucherEdit from '../components/voucher/VoucherEdit.vue'
import LedgerMain from '../components/ledger/LedgerMain.vue'
import LedgerList from '../components/ledger/LedgerList.vue'
import ClosePeriod from '../components/period/ClosePeriod.vue'

/**
 * In some cases, we need to browser redirect to home page.
 * Prefer to use browser redirect, so that backend gateway can do the session verification and redirect to login if needed.
 */
export function goHome() {
  window.location.replace('/ui')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/ui',
    component: AppLayout,
    beforeEnter: [verifyCurrentUser, loadWorkingSob],
    children: [
      // home
      {
        path: '',
        name: 'home',
        component: NotImplemented,
      },
      // about
      {
        path: 'about',
        name: 'about',
        component: NotImplemented,
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
        name: 'sobMain',
        component: SobMain,
        children: [
          {
            path: 'new',
            name: 'sobNew',
            component: SobEdit,
            props: { editMode: 'create' },
          },
          {
            path: ':sobId/init',
            name: 'ledgerInitialize',
            component: LedgerInitialize,
            props: true,
          },
          {
            path: ':sobId/:view(\\d+)?',
            name: 'sobDetail',
            component: SobDetail,
            props: true,
          },
        ],
      },
      // vouchers
      {
        path: 'sobs/:sobId/vouchers',
        name: 'voucherMain',
        component: VoucherMain,
        beforeEnter: updateWorkingSob,
        props: true,
        children: [
          {
            path: 'new',
            name: 'voucherNew',
            component: VoucherEdit,
            props: (route) => ({ sobId: route.params['sobId'] }),
          },
          {
            path: ':voucherId',
            name: 'voucherDetail',
            component: VoucherEdit,
            props: (route) => ({ sobId: route.params['sobId'], voucherId: route.params['voucherId'] }),
          },
        ],
      },
      // ledgers
      {
        path: 'sobs/:sobId/periods',
        name: 'ledgerMain',
        component: LedgerMain,
        beforeEnter: updateWorkingSob,
        props: true,
        children: [
          {
            path: ':periodId',
            name: 'ledgerList',
            component: LedgerList,
            props: true,
          },
        ],
      },
      {
        path: 'sobs/:sobId/close-period',
        name: 'closePeriod',
        component: ClosePeriod,
        props: true,
      },
      // reports
      {
        path: 'sobs/:sobId/reports',
        component: RouterView,
        props: true,
        beforeEnter: updateWorkingSob,
        children: [
          {
            path: '',
            name: 'reportMain',
            component: NotImplemented,
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
        name: 'login',
        component: AuthenticationLogin,
      },
      {
        path: 'logout',
        name: 'logout',
        component: AuthenticationLogout,
      },
      {
        path: 'register',
        name: 'register',
        beforeEnter: verifyNotLoggedIn,
        component: RegisterUser,
      },
    ],
  },
  {
    path: '/error',
    name: 'exception',
    component: NotImplemented,
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotImplemented,
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
