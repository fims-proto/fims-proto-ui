<script lang="ts" setup>
import { ref } from 'vue'
const inputDate = ref(new Date())
</script>

<!-- style test page for Tailwindcss -->
<template>
  <div class="h-full w-full space-y-4 pt-8 pb-60 px-8 overflow-scroll bg-neutral-600">
    <p class="text-neutral-50">Typograph:</p>
    <div class="bg-white rounded-lg p-4">
      <h1>h1 标题</h1>
      <h2>h2 标题</h2>
      <h3>h3 标题</h3>
      <h4>h4 标题</h4>
      <h5>h5 及以下就和普通一样了</h5>
      <p>普通人民群众 - &lt;p&gt;</p>
    </div>

    <p class="text-neutral-50">BaseButton:</p>
    <div class="bg-white rounded-lg p-4 space-y-4">
      <!-- normal buttons -->
      <div class="flex gap-4">
        <base-button>Default</base-button>
        <base-button category="primary"> Primary </base-button>
        <base-button>
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          Default
        </base-button>
        <base-button category="primary">
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          Primary
        </base-button>
        <!-- disabled -->
        <base-button disabled>Default</base-button>
        <base-button disabled category="primary"> Primary </base-button>
        <base-button disabled>
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          Default
        </base-button>
        <base-button disabled category="primary">
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          Primary
        </base-button>
      </div>
      <!-- grouped button -->
      <div class="flex gap-4">
        <base-button-group>
          <base-button>
            <template #icon><lock-closed-solid-icon /></template>Fisrt
          </base-button>
          <base-button>Second</base-button>
          <base-button>Third</base-button>
        </base-button-group>

        <base-button-group>
          <base-button disabled>
            <template #icon><lock-closed-solid-icon /></template>Fisrt
          </base-button>
          <base-button disabled>Second</base-button>
        </base-button-group>
      </div>
      <!-- with style class -->
      <div class="flex gap-4">
        <base-button category="primary" class="w-64">
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          <span>固定宽度居中</span>
        </base-button>

        <base-button disabled category="primary" class="w-64">
          <template #icon>
            <lock-closed-solid-icon />
          </template>
          <span>固定宽度但禁止</span>
        </base-button>
      </div>
      <!-- text type -->
      <div>
        <p>
          <span>在文字中的 text 类型</span>
          <base-button category="text">按钮</base-button>
          <span>长这个样子</span>
        </p>
        <p>
          <span>在文字中的 disabled text 类型</span>
          <base-button disabled category="text">按钮</base-button>
          <span>长这个样子</span>
        </p>
      </div>
      <!-- link type -->
      <div>
        <p>
          <span>在文字中的 link 类型</span>
          <base-button category="link">按钮</base-button>
          <span>长这个样子</span>
        </p>
        <p>
          <span>在文字中的 disabled link 类型</span>
          <base-button disabled category="link">按钮</base-button>
          <span>长这个样子</span>
        </p>
      </div>
    </div>

    <p class="text-neutral-50">BaseAlert:</p>
    <div class="bg-white rounded-lg p-4 space-y-4">
      <base-alert type="error" closable message="丹麦的艾辛诺尔堡" />
      <base-alert type="info" message="在城墙的一平台上" />
      <base-alert type="success" closable :show-icon="false" message="守卫柏纳多与佛郎西斯哥入" />
      <base-alert type="warning" message="此时正是深夜, 一片漆黑中, 佛郎西斯哥在城墙上站岗, 而柏纳多来接他的班" />
    </div>

    <p class="text-neutral-50">BaseAvatar:</p>
    <div class="bg-white rounded-lg p-4 space-y-4">
      <div class="flex gap-4">
        <base-avatar>张三</base-avatar>
        <base-avatar>张三</base-avatar>
        <base-avatar>长一点</base-avatar>
        <base-avatar class="h-12 w-12" custom-sizing>大一号</base-avatar>
        <base-avatar class="h-8 w-8" custom-sizing>张三</base-avatar>
        <base-avatar>
          <template #icon>
            <emoji-happy-outline-icon />
          </template>
          Should not display
        </base-avatar>
        <base-avatar class="bg-warning-600 text-warning-100" custom-color>
          <template #icon>
            <emoji-happy-outline-icon />
          </template>
        </base-avatar>
      </div>
    </div>

    <p class="text-neutral-50">BaseDropdown:</p>
    <div class="bg-white rounded-lg p-4 space-x-4">
      <base-dropdown>
        <base-dropdown-button class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >双节棍
        </base-dropdown-button>
        <template #overlay>
          <base-dropdown-group>
            <base-dropdown-item>岩烧店的烟味弥漫</base-dropdown-item>
            <base-dropdown-item>隔壁是国术馆</base-dropdown-item>
          </base-dropdown-group>
          <base-dropdown-group title="一起唱">
            <base-dropdown-item>快使用双截棍 哼哼哈兮</base-dropdown-item>
            <base-dropdown-item>习武之人切记 仁者无敌</base-dropdown-item>
          </base-dropdown-group>
          <base-dropdown-item>漂亮的回旋踢</base-dropdown-item>
        </template>
      </base-dropdown>

      <base-dropdown placement="bottom-end">
        <base-dropdown-button class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >靠右
        </base-dropdown-button>
        <template #overlay>
          <base-dropdown-item>快使用双截棍 哼哼哈兮 哼哼哈兮 哼哼哈兮</base-dropdown-item>
          <base-dropdown-item>仁者无敌</base-dropdown-item>
        </template>
      </base-dropdown>

      <base-dropdown>
        <base-dropdown-button class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >带图标
        </base-dropdown-button>
        <template #overlay>
          <base-dropdown-item>没图标</base-dropdown-item>
          <base-dropdown-item>
            <template #icon><lock-closed-solid-icon /></template>锁住水分持久保鲜
          </base-dropdown-item>
        </template>
      </base-dropdown>
    </div>

    <p class="text-neutral-50">BaseTag:</p>
    <div class="bg-white rounded-lg p-4 space-x-4">
      <base-tag color="error" closable>气球</base-tag>
      <base-tag color="info">修狗</base-tag>
      <base-tag color="success" closable>汪汪队</base-tag>
      <base-tag color="warning">此时正是深夜, 一片漆黑中</base-tag>
    </div>

    <p class="text-neutral-50">BasePage:</p>
    <div class="bg-white rounded-lg p-4 space-x-4">
      <div class="w-full max-w-screen-lg">
        <base-page subtitle="副标题, 描述性质文本">
          <template #breadcrumb>一级 / 二级 / 三级 / 当前</template>
          <template #title>
            <h1>页标题</h1>
          </template>
          <template #extra>
            <base-button>Some</base-button>
            <base-button category="primary">Buttons</base-button>
          </template>
          <base-tabs>
            <template #tabs>
              <base-tab-item>页签</base-tab-item>
              <base-tab-item>又一个</base-tab-item>
              <base-tab-item>再来</base-tab-item>
            </template>
            <template #panels>
              <base-tab-panel>一些随意的内容</base-tab-panel>
              <base-tab-panel>
                <div class="flex items-center gap-2">
                  <span>另一些随意的内容</span>
                  <base-button>还有按钮</base-button>
                </div>
              </base-tab-panel>
              <base-tab-panel>别过来</base-tab-panel>
            </template>
          </base-tabs>
        </base-page>
      </div>
    </div>

    <p class="text-neutral-50">BaseForm:</p>
    <div class="bg-white rounded-lg p-4">
      <base-form class="max-w-lg">
        <base-form-item label="普通文本">
          <base-input placeholder="say something..." />
        </base-form-item>

        <base-form-item label="Email 地址">
          <base-input placeholder="快输入..." type="email" autocomplete="email" required />
        </base-form-item>

        <base-form-item label="密码">
          <base-input placeholder="快输入..." type="password" autocomplete="current-password" required />
        </base-form-item>

        <base-form-item label="何年何月">
          <base-input-group>
            <base-input hide-label type="number" suffix="年" />
            <base-input hide-label type="number" suffix="月" />
            <base-input hide-label type="number" suffix="日" />
          </base-input-group>
        </base-form-item>

        <base-form-item label="文本前后缀">
          <base-input placeholder="fims" prefix="https://" suffix=".com" />
        </base-form-item>

        <base-form-item label="控件前后缀_未完成">
          <base-input placeholder="0.00">
            <template #prefix>
              <select class="border-transparent rounded-md text-sm">
                <option>Income</option>
                <option>Outcome</option>
              </select>
            </template>
            <template #suffix>
              <select class="appearance-none border-transparent rounded-md text-sm">
                <option>USD</option>
                <option>CNY</option>
              </select>
            </template>
          </base-input>
        </base-form-item>

        <div>
          <base-button type="submit" category="primary" class="w-full">
            <template #icon>
              <lock-closed-solid-icon />
            </template>
            <span>登录</span>
          </base-button>
        </div>
      </base-form>
    </div>

    <p class="text-neutral-50">Inputs:</p>
    <div class="bg-white rounded-lg p-4">
      <base-form-item label="日期: ">
        <base-input v-model="inputDate" type="date" class="w-40" />
      </base-form-item>
    </div>

    <!-- <p class="text-neutral-50">SomeOthers:</p>
    <div class="bg-white rounded-lg p-4"></div>-->
  </div>
</template>
