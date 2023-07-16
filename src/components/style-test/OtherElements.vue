<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotificationStore } from '../../store/notification'
import { type AppNotification } from '../../domain'
import { type ColumnType } from '../reusable/table'

// inputs
const inputDate = ref(new Date())

// notification
const notificationStore = useNotificationStore()
const onNewNotification = (text?: string) => {
  const index = Math.floor(Math.random() * 4)
  notificationStore.action.push({
    type: ['error', 'info', 'success', 'warning'][index] as AppNotification['type'],
    message: text ?? ['打雷啦', '下雨啦', '收衣服啦', '衣服掉地上啦'][index],
    duration: Math.floor(Math.random() * 4),
  })
}

// table
const tablePage = ref({ currentPage: 1, totalElement: 55, pageSize: 10 })
const tableData = ref<{ company: string; contact: string; address: string; city: string }[]>([])
watch(
  [() => tablePage.value.currentPage, () => tablePage.value.pageSize],
  () => {
    tableData.value = []
    for (let i = 0; i < tablePage.value.pageSize; i++) {
      const index = Math.floor(Math.random() * 4)
      tableData.value.push({
        company: ['Google', 'Facebook', 'Twitter', 'Nokia'][index],
        contact: ['Donald', 'Michael', 'Trump', 'Json'][index],
        address: [
          'No. 699, Wangshang Road, Binjiang District',
          '1 Infinite Loop Cupertino, CA 95014',
          '	1600 Amphitheatre Parkway Mountain View, CA 94043',
          'Park Ridge, NJ 07656',
        ][index],
        city: ['New York', 'Kuerla', 'Helsinki', 'Cupertino'][index],
      })
    }
  },
  { immediate: true },
)

const tableColumns: ColumnType[] = [
  {
    title: '公司',
    path: 'company',
    width: 'sm',
  },
  {
    title: '联系人',
    path: 'contact',
    width: 'md',
  },
  {
    title: '地址',
    path: 'address',
  },
  {
    title: '城市',
    path: 'city',
    width: 'lg',
  },
]

// list
const listData = ref<
  {
    text: string
    active: boolean
  }[]
>([])
for (let i = 0; i < 20; i++) {
  listData.value.push({
    text: `项目第 ${i} 号`,
    active: false,
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
        <BaseButton @click="onNewNotification('Ta-da!!')">Default</BaseButton>
        <BaseButton category="primary"> Primary </BaseButton>
        <BaseButton>
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          Default
        </BaseButton>
        <BaseButton category="primary">
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          Primary
        </BaseButton>
        <BaseButton>
          <template #icon>
            <LockClosedMiniIcon />
          </template>
        </BaseButton>
        <!-- disabled -->
        <BaseButton disabled>Default</BaseButton>
        <BaseButton disabled category="primary"> Primary </BaseButton>
        <BaseButton disabled>
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          Default
        </BaseButton>
        <BaseButton disabled category="primary">
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          Primary
        </BaseButton>
        <BaseButton category="flat">Flat</BaseButton>
        <BaseButton disabled category="flat">Flat</BaseButton>
      </div>
      <!-- grouped button -->
      <div class="flex gap-4">
        <BaseButtonGroup>
          <BaseButton>
            <template #icon><LockClosedMiniIcon /></template>Fisrt
          </BaseButton>
          <BaseConfirmationButton @click="onNewNotification('2nd Thoughts!!')">2nd thought</BaseConfirmationButton>
          <BaseButton>Third</BaseButton>
        </BaseButtonGroup>

        <BaseButtonGroup>
          <BaseButton disabled>
            <template #icon><LockClosedMiniIcon /></template>Fisrt
          </BaseButton>
          <BaseButton disabled>Second</BaseButton>
        </BaseButtonGroup>
      </div>
      <!-- with style class -->
      <div class="flex gap-4">
        <BaseButton category="primary" class="w-64">
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          <span>固定宽度居中</span>
        </BaseButton>

        <BaseButton disabled category="primary" class="w-64">
          <template #icon>
            <LockClosedMiniIcon />
          </template>
          <span>固定宽度但禁止</span>
        </BaseButton>
      </div>
      <!-- double confirm -->
      <div class="flex gap-4">
        <BaseConfirmationButton category="primary" @click="onNewNotification('Ta-da after confirmation!!')">
          重要事件
        </BaseConfirmationButton>
      </div>
    </div>

    <h1 class="text-neutral-900">BaseLink:</h1>
    <div class="flex items-center gap-4 rounded-lg p-4">
      <BaseNavLink to="/styleTest">Nav link</BaseNavLink>
      <BaseLink>Base link</BaseLink>
      <BaseLink menu>Menu link</BaseLink>
    </div>

    <h1 class="text-neutral-900">BaseNotification:</h1>
    <div class="rounded-lg p-4 space-y-4">
      <BaseNotification type="error" closable message="丹麦的艾辛诺尔堡" />
      <BaseNotification type="info" message="在城墙的一平台上" />
      <BaseNotification type="success" closable :show-icon="false" message="没有 icon! 守卫柏纳多与佛郎西斯哥入" />
      <BaseNotification type="warning" message="此时正是深夜, 一片漆黑中, 佛郎西斯哥在城墙上站岗, 而柏纳多来接他的班" />
      <BaseNotification
        class="w-72"
        type="error"
        closable
        message="一段比较长的文本, 但是受限在了比较窄的空间, 它将如何表现, 让我们拭目以待, 希望它的图标不会被挤占, 希望它的按钮容易点."
      />
      <BaseButton @click="onNewNotification()">弹出式通知</BaseButton>
    </div>

    <h1 class="text-neutral-900">BaseAvatar:</h1>
    <div class="rounded-lg p-4 space-y-4">
      <div class="flex gap-4">
        <BaseAvatar name="张三" />
        <BaseAvatar name="张三丰荔枝" />
      </div>
    </div>

    <h1 class="text-neutral-900">BaseDropdown:</h1>
    <div class="flex rounded-lg p-4 space-x-4">
      <BaseDropdown>
        <template #trigger>
          <BaseButton category="flat">双节棍</BaseButton>
        </template>
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
        <template #trigger>
          <BaseButton category="primary">靠右</BaseButton>
        </template>
        <template #overlay>
          <BaseDropdownItem>快使用双截棍 哼哼哈兮 哼哼哈兮 哼哼哈兮</BaseDropdownItem>
          <BaseDropdownItem>仁者无敌</BaseDropdownItem>
        </template>
      </BaseDropdown>

      <BaseDropdown>
        <template #trigger>
          <BaseAvatar name="张三" class="cursor-pointer" tabindex="0" />
        </template>
        <template #overlay>
          <BaseDropdownItem>没图标</BaseDropdownItem>
          <BaseDropdownItem>
            <template #icon><LockClosedMiniIcon /></template>锁住水分持久保鲜
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
            <BaseButton category="primary">Buttons</BaseButton>
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

    <h1 class="text-neutral-900">Inputs:</h1>
    <div class="rounded-lg p-4">
      <BaseFormItem label="日期: ">
        <BaseInput v-model="inputDate" html-type="date" class="w-40" />
      </BaseFormItem>
    </div>

    <h1 class="text-neutral-900">Table:</h1>
    <div class="rounded-lg p-4">
      <p>Empty table</p>
      <BaseTable :data-source="[]" :columns="tableColumns" />
      <br />
      <p>Table</p>
      <BaseTable
        :data-source="tableData"
        :columns="tableColumns"
        :page="tablePage"
        @page="
          (pageable) => {
            tablePage.currentPage = pageable.page
            tablePage.pageSize = pageable.size ?? 10
          }
        "
      />
    </div>

    <h1 class="text-neutral-900">BaseList:</h1>
    <div class="rounded-lg p-4">
      <div class="w-60 h-60">
        <BaseList hoverable clickable>
          <BaseListItem
            v-for="(item, i) in listData"
            :key="i"
            :active="item.active"
            @click="item.active = !item.active"
          >
            {{ item.text }}
          </BaseListItem>
        </BaseList>
      </div>
    </div>

    <!-- <h1 class="text-neutral-900">SomeOthers:</h1>
    <div class="rounded-lg p-4"></div>-->
  </div>
</template>
