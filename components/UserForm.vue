<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h1 class="text-2xl font-bold mb-6">Steam Whitelist Application</h1>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div>
        <label for="discordUsername" class="block text-sm font-medium text-gray-700 mb-1">
          Discord Username <span class="text-red-500">*</span>
        </label>
        <input
            id="discordUsername"
            v-model="form.discordUsername"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g. username#1234"
        />
      </div>

      <div>
        <label for="age" class="block text-sm font-medium text-gray-700 mb-1">
          Age <span class="text-red-500">*</span>
        </label>
        <input
            id="age"
            v-model.number="form.additionalInfo.age"
            type="number"
            required
            min="13"
            max="99"
            class="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label for="experience" class="block text-sm font-medium text-gray-700 mb-1">
          Experience <span class="text-red-500">*</span>
        </label>
        <textarea
            id="experience"
            v-model="form.additionalInfo.experience"
            required
            rows="4"
            class="w-full px-4 py-2 border rounded-lg"
            placeholder="Describe your previous experience..."
        ></textarea>
      </div>

      <div>
        <label for="referral" class="block text-sm font-medium text-gray-700 mb-1">
          How did you hear about us?
        </label>
        <input
            id="referral"
            v-model="form.additionalInfo.referral"
            type="text"
            class="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label for="additionalInfo" class="block text-sm font-medium text-gray-700 mb-1">
          Additional Information
        </label>
        <textarea
            id="additionalInfo"
            v-model="form.additionalInfo.comments"
            rows="4"
            class="w-full px-4 py-2 border rounded-lg"
            placeholder="Anything else you'd like us to know..."
        ></textarea>
      </div>

      <div class="flex items-center space-x-2">
        <input
            id="terms"
            v-model="acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600"
        />
        <label for="terms" class="text-sm text-gray-700">
          I agree to the terms and conditions <span class="text-red-500">*</span>
        </label>
      </div>

      <div>
        <button
            type="submit"
            :disabled="submitting"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          <span v-if="submitting">Submitting...</span>
          <span v-else>Submit Application</span>
        </button>
      </div>

      <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserFormData } from '~/models/User';

const emit = defineEmits<{
  (e: 'submit-success', status: 'pending' | 'approved' | 'denied' | 'removed'): void
}>();

const form = ref<UserFormData>({
  discordUsername: '',
  additionalInfo: {
    age: undefined,
    experience: '',
    referral: '',
    comments: ''
  }
});

const submitting = ref(false);
const error = ref('');
const acceptTerms = ref(false);

const submitForm = async () => {
  if (!acceptTerms.value) {
    error.value = 'You must accept the terms and conditions';
    return;
  }

  submitting.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/user/submit', {
      method: 'POST',
      body: form.value
    });

    if (response.success) {
      emit('submit-success', response.status);
    } else {
      error.value = response.message || 'An error occurred while submitting your application';
    }
  } catch (err: any) {
    console.error('Error submitting form:', err);
    error.value = err.message || 'An error occurred while submitting your application';
  } finally {
    submitting.value = false;
  }
};
</script>