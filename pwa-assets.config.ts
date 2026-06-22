import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  images: ['public/icon.svg'],
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon-48.png'], [64, 'favicon-64.png']],
    },
    maskable: {
      sizes: [512],
      padding: 0.3,
    },
    apple: {
      sizes: [180],
      padding: 0.3,
    },
  },
})
