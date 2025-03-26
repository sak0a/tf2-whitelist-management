import jwt from 'jsonwebtoken';

export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return;

    const cookie = useCookie('auth_token');

    if (!cookie.value) {
        return navigateTo('/');
    }

    try {
        const decoded = jwt.verify(cookie.value, useRuntimeConfig().jwtSecret);
        const userStore = useUserStore();
        userStore.setAuthData(decoded);

        // Check if user has submitted form already and update store
        $fetch('/api/auth/status').then(response => {
            userStore.setSubmissionStatus(response.status);
        }).catch(error => {
            console.error('Error fetching submission status:', error);
        });

    } catch (error) {
        console.error('Invalid token:', error);
        return navigateTo('/');
    }
});