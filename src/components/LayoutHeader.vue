<script lang="ts">
import { computed, defineComponent, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { DownOutlined } from '@ant-design/icons-vue'
import { useSobStore } from '../store/sob'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { UserService } from '../domain'

export default defineComponent({
  components: { DownOutlined },
  setup() {
    const t = useI18n().t
    const router = useRouter()
    const sobStore = useSobStore()
    const userStore = useUserStore()

    const { sobs, currentSob, currentPeriod } = toRefs(sobStore.state)
    const { traits } = toRefs(userStore.state)

    const period = computed(() => {
      return currentPeriod.value ? `${currentPeriod.value.financialYear}-${currentPeriod.value.number}` : t('ledger.periodUnselected')
    })

    return {
      t,
      activeMenuKey: ref(undefined),
      traits,
      sobs,
      currentSob,
      period,
      onSelectSob(item: any) {
        if (item.key === 'nav') {
          router.push({ name: 'sobMain' })
        } else {
          sobStore.action.setCurrentSob(item.key)
        }
      },
      onLogout() {
        UserService.logout()
      }
    }
  }
})
</script>

<template>
  <div class="layout-header">
    <div class="layout-header__left">
      <div class="layout-header__logo">
        <span type="primary">
          <base-link :to="{ name: 'home' }">fims</base-link>
        </span>
      </div>

      <a-dropdown :trigger="['click']" placement="bottomLeft">
        <a-button type="text" class="sob-selection" @click.prevent>
          <a-space>
            <span class="sob-selection__sob">{{ currentSob ? currentSob.name : t('sob.selectSob') }}</span>
            <span class="sob-selection__period">{{ period }}</span>
            <down-outlined />
          </a-space>
        </a-button>
        <template #overlay>
          <a-menu @click="onSelectSob">
            <a-menu-item-group :title="t('sob.selectSob')">
              <a-menu-item v-for="sob in sobs" :key="sob.id">
                <a-space>
                  <span>{{ sob.name }}</span>
                  <a-tag color="success" v-if="sob.id === currentSob?.id">{{ t('sob.current') }}</a-tag>
                </a-space>
              </a-menu-item>
            </a-menu-item-group>
            <a-menu-divider />
            <a-menu-item key="nav">{{ t('sob.manageSob') }}</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <div class="layout-header__menu">
        <a-menu v-model:selectedKeys="activeMenuKey" mode="horizontal">
          <a-menu-item key="voucher">{{ t('voucher.title') }}</a-menu-item>
          <a-menu-item key="ledger">{{ t('ledger.title') }}</a-menu-item>
        </a-menu>
      </div>
    </div>

    <div class="layout-header__right">
      <div>
        <a-dropdown :trigger="['click']" placement="bottomRight">
          <a-avatar
            style="background-color: #333; color: #fff; cursor: pointer;"
          >{{ traits.name?.first }}</a-avatar>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <base-link :to="{ name: 'profile' }">{{ t('profile.updateProfile') }}</base-link>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item @click="onLogout">{{ t('user.logout') }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.layout-header__left {
  display: flex;
  align-items: center;
}

.layout-header__left > * {
  display: flex;
  align-items: center;
  padding: 0 2rem;
  border-right: solid 1px var(--n-border-color);
}

.layout-header__left > *:first-child {
  padding-left: 0;
}

.layout-header__right {
  display: flex;
  align-items: stretch;
}

.layout-header__right > * {
  display: flex;
  align-items: center;
  padding: 0 2rem;
  border-left: solid 1px var(--n-border-color);
}

.layout-header__right > *:last-child {
  padding-right: 0;
}

.layout-header__logo {
  font-weight: bolder;
  font-size: 2rem;
}

.sob-selection {
  cursor: pointer;
}

.sob-selection__sob {
  font-weight: bold;
}

.sob-selection__indicator_active {
  transform: rotate(180deg);
}
</style>