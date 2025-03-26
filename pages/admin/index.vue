<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Stats cards -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-500 mb-2">Total Applications</h3>
        <p class="text-3xl font-bold">{{ stats.total }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-500 mb-2">Pending Review</h3>
        <p class="text-3xl font-bold text-yellow-500">{{ stats.pending }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-500 mb-2">Approved</h3>
        <p class="text-3xl font-bold text-green-500">{{ stats.approved }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold">Recent Applications</h2>
      </div>

      <div class="p-6">
        <!-- Search and filter controls -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-grow">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, Steam ID, or Discord username"
                class="w-full px-4 py-2 border rounded-lg"
                @input="debounceSearch"
            />
          </div>

          <div class="w-full md:w-48">
            <select
                v-model="filterStatus"
                class="w-full px-4 py-2 border rounded-lg"
                @change="loadUsers"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        <!-- User table -->
        <div class="overflow-x-auto">
          <AdminTable
              :users="users"
              :loading="loading"
              @view-user="viewUserDetails"
          />
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <div>
            <span class="text-sm text-gray-600">
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
              {{ pagination.total }} entries
            </span>
          </div>

          <div class="flex space-x-2">
            <button
                @click="prevPage"
                :disabled="pagination.page <= 1"
                class="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
                @click="nextPage"
                :disabled="pagination.page >= pagination.pages"
                class="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User details modal -->
    <UserDetails
        v-if="selectedUser"
        :user="selectedUser"
        :open="!!selectedUser"
        @close="selectedUser = null"
        @status-updated="handleStatusUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User } from '~/models/User';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
});

// Stats data
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  denied: 0,
  removed: 0
});

// Users table data
const users = ref<User[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterStatus = ref('');
const selectedUser = ref<User | null>(null);

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1
});

let searchTimeout: NodeJS.Timeout;

// Load users with current filters
const loadUsers = async () => {
  loading.value = true;

  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    });

    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }

    if (filterStatus.value) {
      params.append('status', filterStatus.value);
    }

    const response = await $fetch(`/api/admin/users?${params.toString()}`);
    users.value = response.users;
    pagination.value = response.pagination;

    // Also load stats
    await loadStats();
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    loading.value = false;
  }
};

// Load dashboard stats
const loadStats = async () => {
  try {
    const response = await $fetch('/api/admin/stats');
    stats.value = response;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

// Debounce search input
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1; // Reset to first page on new search
    loadUsers();
  }, 300);
};

// Pagination methods
const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    loadUsers();
  }
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    loadUsers();
  }
};

// View user details
const viewUserDetails = (user: User) => {
  selectedUser.value = user;
};

// Handle user status update
const handleStatusUpdate = () => {
  loadUsers();
  selectedUser.value = null;
};

// Initial load
onMounted(() => {
  loadUsers();
});
</script>