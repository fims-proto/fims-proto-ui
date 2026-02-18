<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UpdatePassword from './UpdatePassword.vue'
import UpdateProfile from './UpdateProfile.vue'
</script>

<template>
  <div class="flex h-full items-start justify-center overflow-auto p-6">
    <Card class="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{{ $t('profile.title') }}</CardTitle>
        <CardDescription>{{ $t('profile.description') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="account" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="account">{{ $t('profile.updateProfile') }}</TabsTrigger>
            <TabsTrigger value="password">{{ $t('profile.updatePassword') }}</TabsTrigger>
          </TabsList>
          <TabsContent value="account" class="mt-6">
            <UpdateProfile />
          </TabsContent>
          <TabsContent value="password" class="mt-6">
            <UpdatePassword />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
