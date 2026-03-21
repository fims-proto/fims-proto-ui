import { createRouter, createWebHistory, RouterView, type RouteRecordRaw } from 'vue-router'
import { loadWorkingSob, updateWorkingSob, verifyCurrentUser, verifyNotLoggedIn } from './before-enter-handlers'
import { protectUnsavedChanges } from './before-leave-handlers'
import AppLayout from '@/components/AppLayout.vue'
import NotImplementedPage from '@/components/pages/NotImplementedPage.vue'
import ExceptionPage from '@/components/pages/ExceptionPage.vue'
import NotFoundPage from '@/components/pages/NotFoundPage.vue'
import AuthenticationLogin from '@/components/user/AuthenticationLogin.vue'
import AuthenticationLogout from '@/components/user/AuthenticationLogout.vue'
import RegisterUser from '@/components/user/RegisterUser.vue'
import ProfileSetting from '@/components/user/ProfileSetting.vue'
import SobDetail from '@/components/sob/SobDetail.vue'
import SobList from '@/components/sob/SobList.vue'
import AccountList from '@/components/account/AccountList.vue'
import AccountDetail from '@/components/account/AccountDetail.vue'
import DimensionCategories from '@/components/dimension/DimensionCategories.vue'
import DimensionOptions from '@/components/dimension/DimensionOptions.vue'
import LedgerInitialize from '@/components/ledger/LedgerInitialize.vue'
import LedgerOverview from '@/components/ledger/LedgerOverview.vue'
import AccountExplorer from '@/components/ledger/AccountExplorer.vue'
import JournalList from '@/components/journal/JournalList.vue'
import JournalDetail from '@/components/journal/JournalDetail.vue'
import ReportList from '@/components/report/ReportList.vue'
import ReportDetail from '@/components/report/ReportDetail.vue'
import PeriodList from '@/components/period/PeriodList.vue'
import PeriodDetail from '@/components/period/PeriodDetail.vue'

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
    beforeEnter: [verifyCurrentUser, loadWorkingSob, updateWorkingSob],
    component: AppLayout,
    children: [
      // home
      {
        path: '',
        name: 'home',
        components: {
          main: NotImplementedPage,
        },
      },
      // about
      {
        path: 'about',
        name: 'about',
        components: {
          main: NotImplementedPage,
        },
      },
      // profile
      {
        path: 'profile/settings',
        name: 'profile',
        components: {
          main: ProfileSetting,
        },
      },
      // sobs
      {
        path: 'sobs',
        children: [
          {
            path: '',
            name: 'sobList',
            components: {
              list: SobList,
              main: NotImplementedPage,
            },
          },
          {
            path: 'new',
            name: 'sobNew',
            props: { list: false, main: true },
            components: {
              list: SobList,
              main: SobDetail,
            },
          },
          {
            path: ':sobId',
            name: 'sobDetail',
            props: { list: false, main: true },
            components: {
              list: SobList,
              main: SobDetail,
            },
          },
        ],
      },
      // ledger initialization
      {
        path: 'sobs/:sobId/initialize',
        name: 'ledgerInitialize',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        props: {
          main: (route) => ({ sobId: route.params.sobId }),
        },
        components: {
          main: LedgerInitialize,
        },
      },
      // chart of accounts
      {
        path: 'sobs/:sobId/coa',
        children: [
          {
            path: '',
            name: 'accountList',
            props: { list: (route) => ({ sobId: route.params.sobId }) },
            components: {
              list: AccountList,
            },
          },
          {
            path: 'new',
            name: 'accountNew',
            meta: {
              listPanelSize: 60,
              mainPanelSize: 40,
            },
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({ sobId: route.params.sobId }),
            },
            components: {
              list: AccountList,
              main: AccountDetail,
            },
          },
          {
            path: ':accountId',
            name: 'accountDetail',
            meta: {
              listPanelSize: 60,
              mainPanelSize: 40,
            },
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({ sobId: route.params.sobId, accountId: route.params.accountId }),
            },
            components: {
              list: AccountList,
              main: AccountDetail,
            },
          },
        ],
      },
      // dimensions
      {
        path: 'sobs/:sobId/dimensions',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        children: [
          {
            path: '',
            name: 'dimensionList',
            props: { list: (route) => ({ sobId: route.params.sobId }) },
            components: {
              list: DimensionCategories,
            },
          },
          {
            path: ':categoryId',
            name: 'dimensionDetail',
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({ sobId: route.params.sobId, categoryId: route.params.categoryId }),
            },
            components: {
              list: DimensionCategories,
              main: DimensionOptions,
            },
          },
        ],
      },
      // ledgers
      {
        path: 'sobs/:sobId/explorer',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        children: [
          {
            path: 'overview',
            name: 'ledgerOverview',
            props: {
              main: (route) => ({
                sobId: route.params.sobId as string,
                fromPeriod: route.query.fromPeriod as string | undefined,
                toPeriod: route.query.toPeriod as string | undefined,
              }),
            },
            components: {
              main: LedgerOverview,
            },
          },
          {
            path: 'account',
            name: 'accountExplorer',
            props: {
              main: (route) => ({
                sobId: route.params.sobId as string,
                accountId: route.query.accountId as string | undefined,
                fromPeriod: route.query.fromPeriod as string | undefined,
                toPeriod: route.query.toPeriod as string | undefined,
              }),
            },
            components: {
              main: AccountExplorer,
            },
          },
        ],
      },
      // journals
      {
        path: 'sobs/:sobId/journals',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        children: [
          {
            path: '',
            name: 'journalList',
            props: { list: (route) => ({ sobId: route.params.sobId }) },
            components: {
              list: JournalList,
            },
          },
          {
            path: 'new',
            name: 'journalNew',
            meta: {
              listPanelSize: 30,
              mainPanelSize: 70,
            },
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({
                sobId: route.params.sobId as string,
                referenceJournalId: route.query.referenceJournalId as string | undefined,
              }),
            },
            components: {
              list: JournalList,
              main: JournalDetail,
            },
          },
          {
            path: ':journalId',
            name: 'journalDetail',
            meta: {
              listPanelSize: 30,
              mainPanelSize: 70,
            },
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({ sobId: route.params.sobId, journalId: route.params.journalId }),
            },
            components: {
              list: JournalList,
              main: JournalDetail,
            },
          },
        ],
      },
      // reports
      {
        path: 'sobs/:sobId/reports',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        children: [
          {
            path: '',
            name: 'reportList',
            props: { list: (route) => ({ sobId: route.params.sobId }) },
            components: {
              list: ReportList,
            },
          },
          {
            path: ':reportId',
            name: 'reportDetail',
            meta: {
              listPanelSize: 30,
              mainPanelSize: 70,
            },
            props: {
              list: (route) => ({ sobId: route.params.sobId }),
              main: (route) => ({ sobId: route.params.sobId, reportId: route.params.reportId }),
            },
            components: {
              list: ReportList,
              main: ReportDetail,
            },
          },
        ],
      },
      // periods
      {
        path: 'sobs/:sobId/periods/:periodId',
        name: 'periodDetail',
        beforeEnter: [loadWorkingSob, updateWorkingSob],
        meta: { listPanelSize: 25, mainPanelSize: 75 },
        props: {
          list: (route) => ({ sobId: route.params.sobId as string }),
          main: (route) => ({
            sobId: route.params.sobId as string,
            periodId: route.params.periodId as string,
          }),
        },
        components: {
          list: PeriodList,
          main: PeriodDetail,
        },
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
    component: ExceptionPage,
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(protectUnsavedChanges)

router.onError((...args) => {
  console.log(args)
  router.push({ name: 'exception' })
})

export default router
