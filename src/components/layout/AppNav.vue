<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSobStore } from '@store/sob'
import { useUserStore } from '@store/user'
import { UserService } from '@domain/user'
import type { MenuItem } from 'primevue/menuitem'
import type { MenuItem as AppMenuItem } from './AppMenu.vue'
import AppMenu from './AppMenu.vue'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const userStore = useUserStore()

const sobMenu = ref()

const { sobs, workingSob, currentPeriod } = toRefs(sobStore.state)
const { traits: userInfo } = toRefs(userStore.state.user)

const periodText = computed(() =>
  currentPeriod.value
    ? t('period.periodText', {
        fiscalYear: currentPeriod.value.fiscalYear,
        number: currentPeriod.value.periodNumber,
      })
    : t('period.periodUnselected'),
)

const sobText = computed(() => (workingSob.value ? workingSob.value.name : t('sob.sobUnselected')))
const sobMenuItems = computed((): MenuItem[] =>
  [
    {
      label: t('sob.manageSob'),
      command: () => router.push({ name: 'sobMain' }),
      icon: 'pi pi-shop',
    },
    {
      separator: true,
    },
  ].concat(
    sobs.value.map((s) => ({
      label: s.name,
      command: async () => {
        await sobStore.action.setWorkingSob(s.id)
        router.push({ name: 'home' })
      },
      icon: 'pi pi-check',
      current: s.id === workingSob.value?.id,
      sob: true,
    })),
  ),
)

const menuItems = computed((): AppMenuItem[] => {
  if (!currentPeriod.value) []
  return [
    {
      label: t('voucher.title'),
      icon: 'pi pi-receipt',
      command: () => router.push({ name: 'voucherMain', params: { sobId: workingSob.value?.id } }),
    },
    {
      label: t('ledger.title'),
      icon: 'pi pi-book',
      command: () => router.push({ name: 'ledgerMain', params: { sobId: workingSob.value?.id } }),
    },
    {
      label: t('period.close.title'),
      icon: 'pi pi-file-check',
      command: () => router.push({ name: 'closePeriod', params: { sobId: workingSob.value?.id } }),
    },
    {
      label: t('report.subjectName'),
      icon: 'pi pi-table',
      command: () => router.push({ name: 'reportList', params: { sobId: workingSob.value?.id } }),
    },
  ]
})

const footerMenuItems: AppMenuItem[] = [
  {
    label: 'Dark Mode',
    icon: 'pi pi-moon',
    command: () => document.documentElement.classList.toggle('dark'),
  },
  {
    label: userInfo.value.name?.first ?? '',
    icon: 'pi pi-user',
    command: () => router.push({ name: 'profile' }),
  },
  {
    label: t('user.logout'),
    icon: 'pi pi-sign-out',
    command: () => UserService.logout(),
  },
]
</script>

<template>
  <div class="flex h-full w-full flex-col gap-2">
    <!-- Logo -->
    <RouterLink :to="{ name: 'home' }" class="flex flex-col px-2 font-serif text-2xl font-extrabold text-slate-700">
      fims
    </RouterLink>

    <!-- SoB and Period selection -->
    <button
      @click="(e) => sobMenu.toggle(e)"
      class="group flex flex-col rounded-md p-2 transition hover:bg-slate-300 active:opacity-90"
    >
      <span class="text-bold text-color text-pretty text-left">{{ sobText }}</span>
      <span v-if="currentPeriod" class="text-sm opacity-70">{{ periodText }}</span>
    </button>
    <Menu id="overlay-menu" ref="sobMenu" :model="sobMenuItems" :popup="true">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action">
          <span v-if="item.current || !item.sob" :class="[item.icon, { 'text-primary-color': item.current }, 'w-4']" />
          <span v-else class="w-4" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <!-- Main menu -->
    <AppMenu :model="menuItems" class="grow" />

    <!-- Footer menu -->
    <AppMenu :model="footerMenuItems" />
  </div>
</template>
