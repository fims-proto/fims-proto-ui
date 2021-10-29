<script lang="ts">
import { defineComponent } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Auth from '../domain/Auth';
import { useUserStore } from '../store/user';

export default defineComponent({
  setup() {
    const i18n = useI18n()
    const userStore = useUserStore()
    const router = useRouter()

    const handleAvatarCommand = (command: string) => {
      switch (command) {
        case 'changeProfile':
          router.push({ name: 'userSettings' })
          break;
        case 'logout':
          Auth.logout()
          break;
        default:
          break;
      }
    }

    const handleLanguageCommand = (local: string) => {
      i18n.locale.value = local
    }

    return {
      i18n,
      t: i18n.t,
      user: computed(() => userStore.state.user),
      handleAvatarCommand,
      handleLanguageCommand
    }
  }
})
</script>

<template>
  <el-container>
    <el-header class="header">
      <div class="header__menu">
        <router-link to="/" class="header__menu__app-title header__menu__item">FIMS</router-link>
        <router-link to="/sobs" class="header__menu__item">{{ t('sob.common.sobs') }}</router-link>
      </div>

      <div class="header__menu">
        <div v-if="user" class="header__menu__item">
          <el-dropdown trigger="click" @command="handleAvatarCommand">
            <el-link icon="el-icon-user">{{ user?.firstName }}</el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  disabled
                >{{ t('common.greeting', [user?.lastName, user?.firstName]) }}</el-dropdown-item>
                <el-dropdown-item command="changeProfile" divided>{{ t('user.changeProfile') }}</el-dropdown-item>
                <el-dropdown-item command="logout" divided>{{ t('user.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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