<script setup lang="ts">
import { toRefs, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UserService } from '../domain'
import { useSobStore } from '../store/sob'
import { useUserStore } from '../store/user'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const userStore = useUserStore()

const { sobs, workingSob, currentPeriod } = toRefs(sobStore.state)
const { traits: userInfo } = toRefs(userStore.state)

const navigation = computed(() => {
  const items = []

  if (currentPeriod.value?.id) {
    items.push({
      key: 'voucher',
      label: t('voucher.title'),
      to: {
        name: 'voucherMain',
        params: {
          sobId: workingSob.value?.id,
        },
      },
    })
    items.push({
      key: 'legder',
      label: t('ledger.title'),
      to: {
        name: 'ledgerMain',
        params: {
          sobId: workingSob.value?.id,
        },
      },
    })
    items.push({
      key: 'close-period',
      label: t('period.close.title'),
      to: {
        name: 'closePeriod',
        params: {
          sobId: workingSob.value?.id,
        },
      },
    })
  }

  return items
})

const period = computed(() =>
  currentPeriod.value
    ? t('period.periodText', {
        fiscalYear: currentPeriod.value.fiscalYear,
        number: currentPeriod.value.periodNumber,
      })
    : t('period.periodUnselected'),
)

const onUserMenuSelected = (key: string) => {
  if (key === 'update-profile') {
    router.push({ name: 'profile' })
  } else if (key === 'logout') {
    UserService.logout()
  }
}

const onSobSelected = async (command: string) => {
  if (command === 'nav') {
    router.push({ name: 'sobMain' })
  } else {
    await sobStore.action.setWorkingSob(command)
    router.push({
      name: 'sobDetail',
      params: {
        sobId: command,
      },
    })
  }
}
</script>

<template>
  <!-- container -->
  <div class="h-16 w-full flex justify-between">
    <!-- left part -->
    <div class="flex gap-4 items-center">
      <!-- logo -->
      <div>
        <RouterLink
          :to="{ name: 'home' }"
          class="px-3 py-2 -ml-3 rounded-md text-xl font-serif italic font-extrabold text-primary-700"
        >
          Fims
        </RouterLink>
      </div>

      <!-- SoB selection -->
      <div>
        <BaseDropdown @select="onSobSelected">
          <template #trigger="{ open }">
            <BaseLink menu>
              <span class="inline font-semibold">{{ workingSob ? workingSob.name : t('sob.selectSob') }}</span>
              <span class="inline">{{ period }}</span>
              <ChevronDownMiniIcon :class="['inline w-4 align-baseline', { 'rotate-180': open }]" aria-hidden="true" />
            </BaseLink>
          </template>

          <template #overlay>
            <BaseDropdownGroup :title="t('sob.selectSob')">
              <BaseDropdownItem v-for="sob in sobs" :key="sob.id" :command="sob.id">
                <span>{{ sob.name }}</span>
                <BaseTag v-if="sob.id === workingSob?.id" color="success">{{ t('sob.current') }}</BaseTag>
              </BaseDropdownItem>
            </BaseDropdownGroup>
            <BaseDropdownItem command="nav">{{ t('sob.manageSob') }}</BaseDropdownItem>
          </template>
        </BaseDropdown>
      </div>

      <!-- navigation -->
      <nav class="space-x-2">
        <BaseNavLink
          v-for="item in navigation"
          :key="item.key"
          :to="item.to"
          class="px-3 py-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-black hover:bg-opacity-5"
          menu
        >
          {{ item.label }}
        </BaseNavLink>
      </nav>
    </div>

    <!-- right part -->
    <div class="flex gap-4 items-center">
      <div>
        <BaseDropdown placement="bottom-end" @select="onUserMenuSelected">
          <template #trigger>
            <BaseAvatar :name="userInfo.name?.first ?? ''" class="h-8 w-8 cursor-pointer" tabindex="0" />
          </template>

          <template #overlay>
            <BaseDropdownGroup>
              <BaseDropdownItem command="update-profile">{{ t('profile.updateProfile') }}</BaseDropdownItem>
            </BaseDropdownGroup>
            <BaseDropdownGroup>
              <BaseDropdownItem command="logout">
                <template #icon>
                  <ArrowLeftOnRectangleMiniIcon />
                </template>
                {{ t('user.logout') }}
              </BaseDropdownItem>
            </BaseDropdownGroup>
          </template>
        </BaseDropdown>
      </div>
    </div>
  </div>
</template>
