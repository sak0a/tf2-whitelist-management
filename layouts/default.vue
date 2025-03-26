<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold">Steam Whitelist Application</h1>
        <div v-if="userStore.isAuthenticated" class="flex items-center space-x-4">
          <img v-if="userStore.avatar" :src="userStore.avatar" alt="Avatar" class="h-8 w-8 rounded-full" />
          <span>{{ userStore.personaName }}</span>
          <button @click="logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm">
            Logout
          </button>
        </div>
        <div v-else>
          <button @click="login" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
            Login with Steam
          </button>
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto p-4">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white p-4 text-center">
      <p>&copy; {{ new Date().getFullYear() }} Steam Whitelist Application</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { steamAuth } from '~/services/steamAuth';

const userStore = useUserStore();

const login = () => {
  steamAuth.login();
};

const logout = () => {
  steamAuth.logout();
};
</script>