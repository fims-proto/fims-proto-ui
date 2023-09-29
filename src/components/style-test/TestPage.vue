<script setup lang="ts">
import { ref } from 'vue'

const type = ref('base')

const showDetailPage = ref(false)
</script>

<template>
  <div class="flex gap-2 mb-2">
    <BaseLink @click="type = 'base'">Base page</BaseLink>
    <BaseLink @click="type = 'split'">Split page</BaseLink>
  </div>

  <div v-if="type === 'base'" class="container mx-auto">
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

  <div
    v-if="type === 'split'"
    class="container flex flex-col gap-2 p-2 mx-auto rounded-md border border-dashed border-neutral-300"
  >
    <span>container</span>
    <BaseSplitPage detail-size="L">
      <template #main>
        <div class="w-full border border-dashed border-error-500">
          <BaseButton @click="showDetailPage = !showDetailPage">Toogle detail page</BaseButton>
        </div>
      </template>

      <template #detail>
        <div class="border border-dashed border-success-500">
          <h2 v-if="showDetailPage">Detail page is here</h2>
        </div>
      </template>
    </BaseSplitPage>
  </div>
</template>
