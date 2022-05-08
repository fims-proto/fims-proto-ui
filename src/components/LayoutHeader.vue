<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSobStore } from '../store/sob'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { UserService } from '../domain'

export default defineComponent({
  setup() {
    const t = useI18n().t
    const router = useRouter()
    const sobStore = useSobStore()
    const userStore = useUserStore()

    const { sobs, workingSob, currentPeriod } = toRefs(sobStore.state)
    const { traits: userInfo } = toRefs(userStore.state)

    const navigation = computed(() => {
      const items = []

      if (workingSob.value?.id) {
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
      }

      return items
    })

    const period = computed(() => {
      return currentPeriod.value
        ? `${currentPeriod.value.financialYear}-${currentPeriod.value.number}`
        : t('ledger.periodUnselected')
    })

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
        router.push({ name: 'home' })
      }
    }

    return {
      t,
      navigation,
      userInfo,
      sobs,
      workingSob,
      period,
      onUserMenuSelected,
      onSobSelected,
    }
  },
})
</script>

<template>
  <!-- container -->
  <div class="h-16 w-full flex justify-between">
    <!-- left part -->
    <div class="flex gap-4 items-center">
      <!-- logo -->
      <div>
        <base-link
          :to="{ name: 'home' }"
          class="px-3 py-2 pl-0 rounded-md text-xl font-serif italic font-extrabold text-primary-700"
          >fims</base-link
        >
      </div>

      <!-- SoB selection -->
      <div>
        <base-dropdown @select="onSobSelected">
          <base-dropdown-button
            v-slot="{ open }"
            as="a"
            class="px-3 py-2 space-x-2 rounded-md whitespace-nowrap text-neutral-700 hover:text-neutral-900 hover:bg-black hover:bg-opacity-5"
          >
            <span class="inline">{{ workingSob ? workingSob.name : t('sob.selectSob') }}</span>
            <span class="inline">{{ period }}</span>
            <chevron-down-outline-icon
              :class="['inline w-3 align-baseline', { 'rotate-180': open }]"
              aria-hidden="true"
            />
          </base-dropdown-button>
          <template #overlay>
            <base-dropdown-group :title="t('sob.selectSob')">
              <base-dropdown-item v-for="sob in sobs" :key="sob.id" :command="sob.id">
                <span>{{ sob.name }}</span>
                <base-tag v-if="sob.id === workingSob?.id" color="success">{{ t('sob.current') }}</base-tag>
              </base-dropdown-item>
            </base-dropdown-group>
            <base-dropdown-item command="nav">{{ t('sob.manageSob') }}</base-dropdown-item>
          </template>
        </base-dropdown>
      </div>

      <!-- navigation -->
      <nav class="space-x-2">
        <base-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.to"
          class="px-3 py-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-black hover:bg-opacity-5"
          >{{ item.label }}</base-link
        >
      </nav>
    </div>

    <!-- right part -->
    <div class="flex gap-4 items-center">
      <div>
        <base-dropdown placement="bottom-end" @select="onUserMenuSelected">
          <base-dropdown-button as="a">
            <base-avatar custom-sizing class="h-8 w-8">{{ userInfo.name?.first }}</base-avatar>
          </base-dropdown-button>
          <template #overlay>
            <base-dropdown-group>
              <base-dropdown-item command="update-profile">{{ t('profile.updateProfile') }}</base-dropdown-item>
            </base-dropdown-group>
            <base-dropdown-group>
              <base-dropdown-item command="logout">
                <template #icon>
                  <logout-outline-icon />
                </template>
                {{ t('user.logout') }}
              </base-dropdown-item>
            </base-dropdown-group>
          </template>
        </base-dropdown>
      </div>
    </div>
  </div>
</template>
