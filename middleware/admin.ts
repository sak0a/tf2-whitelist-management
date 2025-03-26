export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return;

    const userStore = useUserStore();

    if (!userStore.isAdmin) {
        return navigateTo('/');
    }
});