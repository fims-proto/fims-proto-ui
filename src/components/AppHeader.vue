<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSobStore } from '../store/sob'
import { useUserStore } from '../store/user'
import { UserService } from '../domain'
import type { MenuItem } from 'primevue/menuitem'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const userStore = useUserStore()

const userMenu = ref()

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

const menuItems = computed(() => {
  const sobsItem: MenuItem[] = sobs.value.map((s) => ({
    label: s.name,
    command: async () => {
      await sobStore.action.setWorkingSob(s.id)
      router.push({ name: 'home' })
    },
    isCurrent: s.id === workingSob.value?.id,
  }))

  const items: MenuItem[] = [
    // SoB selection
    {
      label: periodText.value,
      items: [
        {
          label: t('sob.manageSob'),
          command: () => router.push({ name: 'sobMain' }),
        },
        {
          separator: true,
        },
        {
          label: t('sob.selectSob'),
          items: sobsItem,
        },
      ],
    },
  ]

  if (currentPeriod.value?.id) {
    items.push(
      ...[
        {
          label: t('voucher.title'),
          command: () => router.push({ name: 'voucherMain', params: { sobId: workingSob.value?.id } }),
        },
        {
          label: t('ledger.title'),
          command: () => router.push({ name: 'ledgerMain', params: { sobId: workingSob.value?.id } }),
        },
        {
          label: t('period.close.title'),
          command: () => router.push({ name: 'closePeriod', params: { sobId: workingSob.value?.id } }),
        },
        {
          label: t('report.title'),
          command: () => router.push({ name: 'reportMain', params: { sobId: workingSob.value?.id } }),
        },
      ],
    )
  }

  return items
})

const userMenuItems: MenuItem[] = [
  {
    label: t('profile.updateProfile'),
    command: () => router.push({ name: 'profile' }),
  },
  {
    label: t('user.logout'),
    command: () => UserService.logout(),
  },
]
</script>

<template>
  <Menubar :model="menuItems">
    <template #start>
      <RouterLink :to="{ name: 'home' }" class="text-xl mr-3 font-extrabold">Fims</RouterLink>
    </template>
    <template #item="{ item, props }">
      <a class="flex items-center" v-bind="props.action">
        <i v-if="item.isCurrent" class="pi pi-check-circle mr-2" />
        <span>{{ item.label }}</span>
      </a>
    </template>
    <template #end>
      <Button
        type="button"
        :label="userInfo.name?.first ?? ''"
        icon="pi pi-user"
        aria-haspopup="true"
        aria-controls="overlay-menu"
        @click="(e: Event) => userMenu.toggle(e)"
      />
      <Menu id="overlay-menu" ref="userMenu" :model="userMenuItems" :popup="true" />
    </template>
  </Menubar>
</template>
