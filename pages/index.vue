<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="!userStore.isAuthenticated" class="text-center py-12">
      <h1 class="text-4xl font-bold mb-6">Welcome to Steam Whitelist Application</h1>
      <p class="text-xl mb-8">Please login with your Steam account to submit an application.</p>
      <button @click="login" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white text-lg flex items-center justify-center mx-auto">
        <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10z"/>
        </svg>
        Login with Steam
      </button>
    </div>

    <div v-else>
      <!-- Check if admin and redirect if needed -->
      <div v-if="userStore.isAdmin && !redirected" class="text-center">
        <p class="text-lg">Admin account detected. Redirecting to dashboard...</p>
      </div>

      <!-- Show status if already submitted -->
      <UserStatus v-else-if="userStore.submissionStatus" />

      <!-- Show form if not submitted yet -->
      <UserForm v-else @submit-success="handleSubmissionSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { steamAuth } from '~/services/steamAuth';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const redirected = ref(false);

onMounted(async () => {
  // Check status first if authenticated
  if (userStore.isAuthenticated) {
    try {
      const response = await $fetch('/api/auth/status');
      userStore.setSubmissionStatus(response.status);

      // Redirect admin to dashboard
      if (userStore.isAdmin) {
        redirected.value = true;
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  }
});

const login = () => {
  steamAuth.login();
};

const handleSubmissionSuccess = (status: 'pending' | 'approved' | 'denied' | 'removed') => {
  userStore.setSubmissionStatus(status);
};
</script>