// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.sass'],
  runtimeConfig: {
    // Server-side environment variables
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    steamApiKey: process.env.STEAM_API_KEY,
    adminSteamId: process.env.ADMIN_STEAM_ID,
    // Client-side environment variables
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000'
    }
  },
  nitro: {
    plugins: ['~/server/plugins/mongoose.ts']
  }
})
