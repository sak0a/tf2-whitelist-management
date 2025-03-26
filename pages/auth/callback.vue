<script setup lang="ts">
import { onMounted } from 'vue';
import { steamAuth } from '~/services/steamAuth';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    const isValid = await steamAuth.validateLogin(params);

    if (isValid) {
      const steamId = steamAuth.extractSteamId(params);
      if (steamId) {
        const userInfo = await steamAuth.getUserInfo(steamId);
        userStore.setUser(userInfo);

        // Check if admin
        const response = await $fetch('/api/auth/status');
        if (response.isAdmin) {
          await router.push('/admin');
        } else {
          await router.push('/');
        }
      }
    } else {
      await router.push('/');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    await router.push('/');
  }
});

</script>