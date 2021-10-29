<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Auth from '../domain/Auth';
import { useUserStore } from '../store/user';

export default defineComponent({
  setup() {
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

    return {
      user: computed(() => userStore.state.user),
      handleAvatarCommand
    }
  }
})
</script>

<template>
  <el-container>
    <el-header class="header">
      <div class="header__menu">
        <router-link to="/" class="header__menu__app-title">FIMS</router-link>
        <router-link to="/sobs">sobs</router-link>
      </div>

      <div :span="12" v-if="user" class="header__user">
        <el-dropdown trigger="click" @command="handleAvatarCommand">
          <el-button round icon="el-icon-user">{{ user?.firstName }}</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>Hello! {{ user?.lastName }} {{ user?.firstName }}</el-dropdown-item>
              <el-dropdown-item command="changeProfile" divided>change profile</el-dropdown-item>
              <el-dropdown-item command="logout" divided>logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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

.header__menu__app-title {
  margin-right: 3rem;
  text-decoration: none;
  font-weight: bolder;
}
</style>