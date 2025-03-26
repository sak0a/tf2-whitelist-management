<template>
  <div class="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Application Status</h1>

    <div class="mb-8">
      <div v-if="userStore.submissionStatus === 'pending'" class="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Your application is currently under review.</p>
            <p class="text-xs mt-1">We'll update you once a decision has been made.</p>
          </div>
        </div>
      </div>

      <div v-else-if="userStore.submissionStatus === 'approved'" class="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Congratulations! Your application has been approved.</p>
            <p class="text-xs mt-1">You have been added to the whitelist.</p>
          </div>
        </div>
      </div>

      <div v-else-if="userStore.submissionStatus === 'denied'" class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Your application has been denied.</p>
            <p class="text-xs mt-1" v-if="applicationDetails?.denialReason">Reason: {{ applicationDetails.denialReason }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="userStore.submissionStatus === 'removed'" class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">You have been removed from the whitelist.</p>
            <p class="text-xs mt-1" v-if="applicationDetails?.denialReason">Reason: {{ applicationDetails.denialReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      <p>Loading application details...</p>
    </div>

    <div v-else-if="applicationDetails" class="space-y-4">
      <h2 class="text-xl font-semibold">Application Details</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Steam Username</p>
          <p>{{ applicationDetails.personaName }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">Steam ID</p>
          <p>{{ applicationDetails.steamId }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">Discord Username</p>
          <p>{{ applicationDetails.discordUsername }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">Submission Date</p>
          <p>{{ formatDate(applicationDetails.submissionTime) }}</p>
        </div>

        <div v-if="applicationDetails.status === 'approved'">
          <p class="text-sm text-gray-500">Approval Date</p>
          <p>{{ formatDate(applicationDetails.approvalTime) }}</p>
        </div>

        <div v-if="applicationDetails.status === 'denied' || applicationDetails.status === 'removed'">
          <p class="text-sm text-gray-500">Denial/Removal Date</p>
          <p>{{ formatDate(applicationDetails.denialTime) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { User } from '~/models/User';

const userStore = useUserStore();
const applicationDetails = ref<User | null>(null);
const loading = ref(true);

onMounted(async () => {
  if (!userStore.steamId) return;

  try {
    const response = await $fetch('/api/user/details', {
      method: 'GET'
    });

    applicationDetails.value = response.user;
  } catch (error) {
    console.error('Error fetching application details:', error);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
</script>