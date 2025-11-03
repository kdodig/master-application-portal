// https://nuxt.com/docs/api/configuration/nuxt-config
/* eslint-disable node/prefer-global/process */
export default defineNuxtConfig({
  compatibilityDate: '2024-11-27',

  runtimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gemma-3-27b-it',
    minio: {
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT ? Number.parseInt(process.env.MINIO_PORT) : 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'applications',
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
  },

  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@pinia/nuxt',
    'nuxt-charts',
    '@formkit/auto-animate/nuxt',
    '@vueuse/nuxt',
    'nuxt-pdfmake',
    'nuxt-auth-utils',
  ],

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  ui: {
    colorMode: false,
  },

  css: ['~/assets/css/main.css'],
})
