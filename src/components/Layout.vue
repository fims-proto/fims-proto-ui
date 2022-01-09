<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { SwitchButton } from '@element-plus/icons';
import Auth from '../domain/Auth';

export default defineComponent({
  setup() {
    const i18n = useI18n()

    const handleLanguageCommand = (local: string) => {
      i18n.locale.value = local
    }

    return {
      SwitchButton,
      i18n,
      t: i18n.t,
      handleLanguageCommand,
      handleLogout: Auth.logout
    }
  }
})
</script>

<template>
  <el-container>
    <el-header class="header">
      <div class="header__menu">
        <router-link :to="{ name: 'home' }" class="header__menu__app-title header__menu__item">FIMS</router-link>
        <router-link :to="{ name: 'sobMain' }" class="header__menu__item">{{ t('sob.common.sobs') }}</router-link>
      </div>

      <div class="header__menu">
        <div class="header__menu__item">
          <el-dropdown trigger="click" @command="handleLanguageCommand">
            <el-link>{{ t(`lang.${i18n.locale.value}`) }}</el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="locale in i18n.availableLocales"
                  :key="`locale-${locale}`"
                  :command="locale"
                >{{ t(`lang.${locale}`) }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="header__menu__item">
          <el-link :icon="SwitchButton" @click="handleLogout"></el-link>
        </div>
      </div>
    </el-header>

    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__menu {
  height: 100%;
  display: flex;
  align-items: center;
}

.header__menu__item:not(:last-child) {
  margin-right: 2rem;
}

.header__menu__app-title {
  text-decoration: none;
  font-weight: bolder;
}
</style>