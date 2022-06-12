<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../store/notification'
import { AppNotification } from '../domain'

const inputDate = ref(new Date())
const notificationStore = useNotificationStore()
const onNewNotification = (text?: string) => {
  const index = Math.floor(Math.random() * 4)
  notificationStore.action.push({
    type: ['error', 'info', 'success', 'warning'][index] as AppNotification['type'],
    message: text ?? ['打雷啦', '下雨啦', '收衣服啦', '衣服掉地上啦'][index],
    duration: Math.floor(Math.random() * 4),
  })
}
</script>

<!-- style test page for Tailwindcss -->
<template>
  <div class="h-full w-full space-y-4 pt-8 pb-60 px-8 overflow-scroll">
    <h1 class="text-neutral-900">Typograph:</h1>
    <div class="rounded-lg p-4">
      <h1>h1 标题</h1>
      <h2>h2 标题</h2>
      <h3>h3 标题</h3>
      <h4>h4 标题</h4>
      <h5>h5 及以下就和普通一样了</h5>
      <p>普通人民群众 - &lt;p&gt;</p>
    </div>

    <h1 class="text-neutral-900">BaseButton:</h1>
    <div class="rounded-lg p-4 space-y-4">
      <!-- normal buttons -->
      <div class="flex gap-4">
        <BaseButton>Default</BaseButton>
        <BaseButton type="primary"> Primary </BaseButton>
        <BaseButton>
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          Default
        </BaseButton>
        <BaseButton type="primary">
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          Primary
        </BaseButton>
        <BaseButton>
          <template #icon>
            <LockClosedSolidIcon />
          </template>
        </BaseButton>
        <!-- disabled -->
        <BaseButton disabled>Default</BaseButton>
        <BaseButton disabled type="primary"> Primary </BaseButton>
        <BaseButton disabled>
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          Default
        </BaseButton>
        <BaseButton disabled type="primary">
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          Primary
        </BaseButton>
      </div>
      <!-- grouped button -->
      <div class="flex gap-4">
        <BaseButtonGroup>
          <BaseButton>
            <template #icon><LockClosedSolidIcon /></template>Fisrt
          </BaseButton>
          <BaseButton>Second</BaseButton>
          <BaseButton>Third</BaseButton>
        </BaseButtonGroup>

        <BaseButtonGroup>
          <BaseButton disabled>
            <template #icon><LockClosedSolidIcon /></template>Fisrt
          </BaseButton>
          <BaseButton disabled>Second</BaseButton>
        </BaseButtonGroup>
      </div>
      <!-- with style class -->
      <div class="flex gap-4">
        <BaseButton type="primary" class="w-64">
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          <span>固定宽度居中</span>
        </BaseButton>

        <BaseButton disabled type="primary" class="w-64">
          <template #icon>
            <LockClosedSolidIcon />
          </template>
          <span>固定宽度但禁止</span>
        </BaseButton>
      </div>
      <!-- double confirm -->
      <div class="flex gap-4">
        <BaseButton type="primary" confirm @click="onNewNotification('Ta-da!!')">重要事件</BaseButton>
      </div>
      <!-- text type -->
      <div>
        <p>
          <span>在文字中的 text 类型</span>
          <BaseButton type="text">按钮</BaseButton>
          <span>长这个样子</span>
        </p>
        <p>
          <span>在文字中的 disabled text 类型</span>
          <BaseButton disabled type="text">按钮</BaseButton>
          <span>长这个样子</span>
        </p>
      </div>
      <!-- link type -->
      <div>
        <p>
          <span>在文字中的 link 类型</span>
          <BaseButton type="link">按钮</BaseButton>
          <span>长这个样子</span>
        </p>
        <p>
          <span>在文字中的 disabled link 类型</span>
          <BaseButton disabled type="link">按钮</BaseButton>
          <span>长这个样子</span>
        </p>
      </div>
    </div>

    <h1 class="text-neutral-900">BaseNotification:</h1>
    <div class="rounded-lg p-4 space-y-4">
      <BaseNotification type="error" closable message="丹麦的艾辛诺尔堡" />
      <BaseNotification type="info" message="在城墙的一平台上" />
      <BaseNotification type="success" closable :show-icon="false" message="守卫柏纳多与佛郎西斯哥入" />
      <BaseNotification type="warning" message="此时正是深夜, 一片漆黑中, 佛郎西斯哥在城墙上站岗, 而柏纳多来接他的班" />
      <BaseButton @click="onNewNotification">弹出式通知</BaseButton>
    </div>

    <h1 class="text-neutral-900">BaseAvatar:</h1>
    <div class="rounded-lg p-4 space-y-4">
      <div class="flex gap-4">
        <BaseAvatar>张三</BaseAvatar>
        <BaseAvatar>张三</BaseAvatar>
        <BaseAvatar>长一点</BaseAvatar>
        <BaseAvatar class="h-12 w-12" custom-sizing>大一号</BaseAvatar>
        <BaseAvatar class="h-8 w-8" custom-sizing>张三</BaseAvatar>
        <BaseAvatar>
          <template #icon>
            <EmojiHappyOutlineIcon />
          </template>
          Should not display
        </BaseAvatar>
        <BaseAvatar class="bg-warning-600 text-warning-100" custom-color>
          <template #icon>
            <EmojiHappyOutlineIcon />
          </template>
        </BaseAvatar>
      </div>
    </div>

    <h1 class="text-neutral-900">BaseDropdown:</h1>
    <div class="rounded-lg p-4 space-x-4">
      <BaseDropdown>
        <BaseDropdownButton class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >双节棍
        </BaseDropdownButton>
        <template #overlay>
          <BaseDropdownGroup>
            <BaseDropdownItem>岩烧店的烟味弥漫</BaseDropdownItem>
            <BaseDropdownItem>隔壁是国术馆</BaseDropdownItem>
          </BaseDropdownGroup>
          <BaseDropdownGroup title="一起唱">
            <BaseDropdownItem>快使用双截棍 哼哼哈兮</BaseDropdownItem>
            <BaseDropdownItem>习武之人切记 仁者无敌</BaseDropdownItem>
          </BaseDropdownGroup>
          <BaseDropdownItem>漂亮的回旋踢</BaseDropdownItem>
        </template>
      </BaseDropdown>

      <BaseDropdown placement="bottom-end">
        <BaseDropdownButton class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >靠右
        </BaseDropdownButton>
        <template #overlay>
          <BaseDropdownItem>快使用双截棍 哼哼哈兮 哼哼哈兮 哼哼哈兮</BaseDropdownItem>
          <BaseDropdownItem>仁者无敌</BaseDropdownItem>
        </template>
      </BaseDropdown>

      <BaseDropdown>
        <BaseDropdownButton class="p-2 rounded-sm shadow-md bg-primary-600 text-white hover:bg-primary-400"
          >带图标
        </BaseDropdownButton>
        <template #overlay>
          <BaseDropdownItem>没图标</BaseDropdownItem>
          <BaseDropdownItem>
            <template #icon><LockClosedSolidIcon /></template>锁住水分持久保鲜
          </BaseDropdownItem>
        </template>
      </BaseDropdown>
    </div>

    <h1 class="text-neutral-900">BaseTag:</h1>
    <div class="rounded-lg p-4 space-x-4">
      <BaseTag color="error" closable>气球</BaseTag>
      <BaseTag color="info">修狗</BaseTag>
      <BaseTag color="success" closable>汪汪队</BaseTag>
      <BaseTag color="warning">此时正是深夜, 一片漆黑中</BaseTag>
    </div>

    <h1 class="text-neutral-900">BasePage:</h1>
    <div class="rounded-lg p-4 space-x-4">
      <div class="w-full max-w-screen-lg">
        <BasePage subtitle="副标题, 描述性质文本">
          <template #breadcrumb>一级 / 二级 / 三级 / 当前</template>
          <template #title>
            <h1>页标题</h1>
          </template>
          <template #extra>
            <BaseButton>Some</BaseButton>
            <BaseButton type="primary">Buttons</BaseButton>
          </template>
          <BaseTabs>
            <template #tabs>
              <BaseTabItem>页签</BaseTabItem>
              <BaseTabItem>又一个</BaseTabItem>
              <BaseTabItem>再来</BaseTabItem>
            </template>
            <template #panels>
              <BaseTabPanel class="h-20">一些随意的内容</BaseTabPanel>
              <BaseTabPanel class="h-20">
                <div class="flex items-center gap-2">
                  <span>另一些随意的内容</span>
                  <BaseButton>还有按钮</BaseButton>
                </div>
              </BaseTabPanel>
              <BaseTabPanel class="h-20">别过来</BaseTabPanel>
            </template>
          </BaseTabs>
        </BasePage>
      </div>
    </div>

    <h1 class="text-neutral-900">BaseForm:</h1>
    <div class="rounded-lg p-4">
      <BaseForm class="max-w-lg">
        <BaseFormItem label="普通文本">
          <BaseInput placeholder="say something..." />
        </BaseFormItem>

        <BaseFormItem label="Email 地址" required>
          <BaseInput placeholder="快输入..." html-type="email" autocomplete="email" required />
        </BaseFormItem>

        <BaseFormItem label="密码" required>
          <BaseInput placeholder="快输入..." html-type="password" autocomplete="current-password" required />
        </BaseFormItem>

        <BaseFormItem label="长宽高">
          <BaseInputGroup>
            <BaseInput hide-label html-type="number" />
            <BaseInput hide-label html-type="number" />
            <BaseInput hide-label html-type="number" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="何年何月">
          <BaseInputGroup>
            <BaseInput hide-label html-type="number" suffix="年" />
            <BaseInput hide-label html-type="number" suffix="月" />
            <BaseInput hide-label html-type="number" suffix="日" />
          </BaseInputGroup>
        </BaseFormItem>

        <BaseFormItem label="文本前后缀">
          <BaseInput placeholder="fims" prefix="https://" suffix=".com" />
        </BaseFormItem>

        <BaseFormItem label="控件前后缀_未完成">
          <BaseInput placeholder="0.00">
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
          </BaseInput>
        </BaseFormItem>

        <div>
          <BaseButton html-type="submit" type="primary" class="w-full">
            <template #icon>
              <LockClosedSolidIcon />
            </template>
            <span>登录</span>
          </BaseButton>
        </div>
      </BaseForm>
    </div>

    <h1 class="text-neutral-900">Inputs:</h1>
    <div class="rounded-lg p-4">
      <BaseFormItem label="日期: ">
        <BaseInput v-model="inputDate" html-type="date" class="w-40" />
      </BaseFormItem>
    </div>

    <!-- <h1 class="text-neutral-900">SomeOthers:</h1>
    <div class="rounded-lg p-4"></div>-->
  </div>
</template>
