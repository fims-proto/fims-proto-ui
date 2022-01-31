<script lang="ts">
import { ChevronDown as ChevronDownIcon } from '@vicons/ionicons5'
import { NText, NMenu, NPopover, NButton, NIcon, NSpace } from 'naive-ui'
import { computed, defineComponent, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSobStore } from '../store/sob'
import BaseLink from './BaseLink.vue'
import SobSelection from './SobSelection.vue'

export default defineComponent({
  components: { NText, NMenu, NPopover, NButton, NIcon, NSpace, ChevronDownIcon, BaseLink, SobSelection },
  setup() {
    const t = useI18n().t
    const sobStore = useSobStore()
    const { currentSob, currentPeriod } = toRefs(sobStore.state)
    const showSobSelection = ref(false)

    const menuOptions = [{
      label: t('voucher.title'),
      key: 'voucher'
    }, {
      label: t('ledger.title'),
      key: 'ledger'
    }]

    const period = computed(() => {
      return currentPeriod.value ? `${currentPeriod.value.financialYear}-${currentPeriod.value.number}` : t('ledger.periodUnselected')
    })

    return {
      t,
      menuOptions,
      activeMenuKey: ref(null),
      currentSob,
      period,
      showSobSelection,
      toggleSobSelection() {
        showSobSelection.value = !showSobSelection.value
      }
    }
  }
})
</script>

<template>
  <div class="layout-header">
    <div class="layout-header__left">
      <div class="layout-header__logo">
        <n-text type="primary">
          <base-link :to="{ name: 'home' }">fims</base-link>
        </n-text>
      </div>
      <n-popover
        placement="bottom-start"
        trigger="click"
        :show-arrow="false"
        :show="showSobSelection"
        @clickoutside="toggleSobSelection"
        raw
      >
        <template #trigger>
          <n-button text class="layout-header__sob-selection" @click="toggleSobSelection">
            <n-space>
              <span
                class="layout-header__sob-selection__sob"
              >{{ currentSob ? currentSob.name : t('sob.selectSob') }}</span>
              <span class="layout-header__sob-selection__period">{{ period }}</span>
              <n-icon
                :class="{ 'layout-header__sob-selection__indicator_active': showSobSelection }"
              >
                <chevron-down-icon />
              </n-icon>
            </n-space>
          </n-button>
        </template>
        <sob-selection @selected="toggleSobSelection" />
      </n-popover>
      <div class="layout-header__menu">
        <n-menu v-model:value="activeMenuKey" mode="horizontal" :options="menuOptions" />
      </div>
    </div>
    <div class="layout-header__right">
      <div>user</div>
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
  align-items: stretch;
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

.layout-header__sob-selection {
  cursor: pointer;
}

.layout-header__logo {
  font-weight: bolder;
  font-size: 2rem;
}

.layout-header__sob-selection__sob {
  font-weight: bold;
}

.layout-header__sob-selection__indicator_active {
  transform: rotate(180deg);
}
</style>