<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-gray-900 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">Admin Dashboard</h1>
        <div class="flex items-center space-x-4">
          <img v-if="userStore.avatar" :src="userStore.avatar" alt="Avatar" class="h-8 w-8 rounded-full" />
          <span>{{ userStore.personaName }}</span>
          <button @click="logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm">
            Logout
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-grow">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 text-white p-4">
        <nav>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                  to="/admin"
                  class="block p-2 rounded hover:bg-gray-700"
                  :class="{ 'bg-gray-700': $route.path === '/admin' }"
              >
                Dashboard
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                  to="/admin/users"
                  class="block p-2 rounded hover:bg-gray-700"
                  :class="{ 'bg-gray-700': $route.path.startsWith('/admin/users') }"
              >
                Manage Users
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                  to="/"
                  class="block p-2 rounded hover:bg-gray-700"
              >
                Back to Site
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-grow p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { steamAuth } from '~/services/steamAuth';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// Redirect if not admin
onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/');
  }
});

const logout = () => {
  steamAuth.logout();
  router.push('/');
};
</script>