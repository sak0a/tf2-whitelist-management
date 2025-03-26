<template>
  <div v-if="open" class="fixed inset-0 overflow-y-auto z-50">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-2xl leading-6 font-bold text-gray-900 mb-4 flex items-center">
                User Details
                <span
                    class="ml-3 px-2 py-1 text-xs leading-5 font-semibold rounded-full"
                    :class="{
                    'bg-yellow-100 text-yellow-800': user.status === 'pending',
                    'bg-green-100 text-green-800': user.status === 'approved',
                    'bg-red-100 text-red-800': user.status === 'denied' || user.status === 'removed'
                  }"
                >
                  {{ capitalize(user.status) }}
                </span>
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- User profile section -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center mb-4">
                    <img :src="user.avatarFull" alt="Steam avatar" class="w-16 h-16 rounded-lg mr-4">
                    <div>
                      <h4 class="text-lg font-bold">{{ user.personaName }}</h4>
                      <a :href="user.profileUrl" target="_blank" class="text-blue-600 hover:underline text-sm">
                        Steam Profile
                      </a>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Steam ID:</span>
                      <span class="ml-2">{{ user.steamId }}</span>
                    </div>

                    <div>
                      <span class="text-sm text-gray-500">Discord Username:</span>
                      <span class="ml-2">{{ user.discordUsername }}</span>
                    </div>

                    <div>
                      <span class="text-sm text-gray-500">VAC Status:</span>
                      <span
                          class="ml-2"
                          :class="{ 'text-red-600': user.vacStatus, 'text-green-600': !user.vacStatus }"
                      >
                        {{ user.vacStatus ? 'VAC Banned' : 'No VAC Bans' }}
                      </span>
                    </div>

                    <div v-if="user.additionalInfo?.gameBans">
                      <span class="text-sm text-gray-500">Game Bans:</span>
                      <span
                          class="ml-2"
                          :class="{ 'text-red-600': user.additionalInfo.gameBans > 0, 'text-green-600': user.additionalInfo.gameBans === 0 }"
                      >
                        {{ user.additionalInfo.gameBans }}
                      </span>
                    </div>

                    <div v-if="user.additionalInfo?.daysSinceLastBan">
                      <span class="text-sm text-gray-500">Days Since Last Ban:</span>
                      <span class="ml-2">{{ user.additionalInfo.daysSinceLastBan }}</span>
                    </div>

                    <div>
                      <span class="text-sm text-gray-500">IP Address:</span>
                      <span class="ml-2">{{ user.ipAddress }}</span>
                    </div>
                  </div>
                </div>

                <!-- Application details section -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-bold mb-4">Application Details</h4>

                  <div class="space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Submitted:</span>
                      <span class="ml-2">{{ formatDate(user.submissionTime) }}</span>
                    </div>

                    <div v-if="user.status === 'approved' && user.approvalTime">
                      <span class="text-sm text-gray-500">Approved:</span>
                      <span class="ml-2">{{ formatDate(user.approvalTime) }}</span>
                    </div>

                    <div v-if="(user.status === 'denied' || user.status === 'removed') && user.denialTime">
                      <span class="text-sm text-gray-500">Denied/Removed:</span>
                      <span class="ml-2">{{ formatDate(user.denialTime) }}</span>
                    </div>

                    <div v-if="user.status === 'denied' || user.status === 'removed'">
                      <span class="text-sm text-gray-500">Reason:</span>
                      <span class="ml-2">{{ user.denialReason || 'No reason provided' }}</span>
                    </div>

                    <div v-if="user.additionalInfo?.age">
                      <span class="text-sm text-gray-500">Age:</span>
                      <span class="ml-2">{{ user.additionalInfo.age }}</span>
                    </div>

                    <div v-if="user.additionalInfo?.experience">
                      <span class="text-sm text-gray-500">Experience:</span>
                      <p class="mt-1 text-sm">{{ user.additionalInfo.experience }}</p>
                    </div>

                    <div v-if="user.additionalInfo?.referral">
                      <span class="text-sm text-gray-500">Referral:</span>
                      <span class="ml-2">{{ user.additionalInfo.referral }}</span>
                    </div>

                    <div v-if="user.additionalInfo?.comments">
                      <span class="text-sm text-gray-500">Additional Comments:</span>
                      <p class="mt-1 text-sm">{{ user.additionalInfo.comments }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions section -->
              <div class="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-bold mb-4">Actions</h4>

                <div v-if="user.status === 'pending'" class="flex flex-wrap gap-2">
                  <button
                      @click="updateStatus('approved')"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve & Whitelist
                  </button>

                  <button
                      @click="showDenyForm = true"
                      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Deny
                  </button>
                </div>

                <div v-else-if="user.status === 'approved'" class="flex flex-wrap gap-2">
                  <button
                      @click="showRemoveForm = true"
                      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove from Whitelist
                  </button>
                </div>

                <div v-else-if="user.status === 'denied' || user.status === 'removed'" class="flex flex-wrap gap-2">
                  <button
                      @click="updateStatus('approved')"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve & Whitelist
                  </button>
                </div>

                <!-- Deny form -->
                <div v-if="showDenyForm" class="mt-4">
                  <h5 class="font-medium mb-2">Denial Reason</h5>
                  <textarea
                      v-model="reasonText"
                      rows="3"
                      class="w-full px-3 py-2 border rounded"
                      placeholder="Please provide a reason for denial"
                  ></textarea>

                  <div class="flex justify-end mt-2 space-x-2">
                    <button
                        @click="showDenyForm = false"
                        class="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                        @click="updateStatus('denied')"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Confirm Deny
                    </button>
                  </div>
                </div>

                <!-- Remove form -->
                <div v-if="showRemoveForm" class="mt-4">
                  <h5 class="font-medium mb-2">Removal Reason</h5>
                  <textarea
                      v-model="reasonText"
                      rows="3"
                      class="w-full px-3 py-2 border rounded"
                      placeholder="Please provide a reason for removal"
                  ></textarea>

                  <div class="flex justify-end mt-2 space-x-2">
                    <button
                        @click="showRemoveForm = false"
                        class="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                        @click="updateStatus('removed')"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Confirm Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User } from '~/models/User';

const props = defineProps<{
  user: User;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status-updated'): void;
}>();

const showDenyForm = ref(false);
const showRemoveForm = ref(false);
const reasonText = ref('');
const loading = ref(false);

const closeModal = () => {
  emit('close');
  showDenyForm.value = false;
  showRemoveForm.value = false;
  reasonText.value = '';
};

const updateStatus = async (status: 'approved' | 'denied' | 'removed') => {
  loading.value = true;

  try {
    await $fetch('/api/admin/update-status', {
      method: 'POST',
      body: {
        userId: props.user._id,
        status,
        reason: (status === 'denied' || status === 'removed') ? reasonText.value : undefined
      }
    });

    emit('status-updated');
    closeModal();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('An error occurred while updating the status');
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
</script>