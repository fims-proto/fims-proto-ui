import { createRouter, createWebHistory, type RouteRecordRaw, RouterView } from 'vue-router'
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
import LedgerMain from '../components/ledger/LedgerMain.vue'
import ClosePeriod from '../components/period/ClosePeriod.vue'
import VoucherMain from '../components/voucher/VoucherMain.vue'
import VoucherCreation from '../components/voucher/VoucherCreation.vue'
import VoucherDetail from '../components/voucher/VoucherDetail.vue'
import ExceptionPage from '../components/ExceptionPage.vue'
import StyleTest from '../components/style-test/StyleTest.vue'
import AccountDetails from '../components/account/AccountDetails.vue'
import ReportMain from '../components/report/ReportMain.vue'
import { verifyCurrentUser, loadWorkingSob, updateWorkingSob, verifyNotLoggedIn } from './before-enter-handlers'
import RegisterUser from '../components/user/RegisterUser.vue'

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
    component: LayoutPage,
    beforeEnter: [verifyCurrentUser, loadWorkingSob],
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
        props: true,
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
            path: ':sobId/:view(\\d+)?',
            name: 'sobDetail',
            component: SobDetail,
          },
        ],
      },
      // accounts
      {
        path: 'sobs/:sobId/accounts',
        component: RouterView,
        props: true,
        beforeEnter: updateWorkingSob,
        children: [
          {
            path: ':accountId',
            name: 'accountDetail',
            component: AccountDetails,
          },
        ],
      },
      // ledgers
      {
        path: 'sobs/:sobId/periods',
        component: RouterView,
        props: true,
        beforeEnter: updateWorkingSob,
        children: [
          {
            path: ':periodId?',
            name: 'ledgerMain',
            component: LedgerMain,
          },
          {
            path: 'close',
            name: 'closePeriod',
            component: ClosePeriod,
          },
        ],
      },
      // vouchers
      {
        path: 'sobs/:sobId/vouchers',
        component: RouterView,
        props: true,
        beforeEnter: updateWorkingSob,
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
            component: ReportMain,
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
    path: '/styleTest/:view?',
    name: 'styleTest',
    component: StyleTest,
    props: true,
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
