import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const base = mode === 'github-pages' ? '/pantry-recipe-pwa/' : '/';

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: '食材管家',
          short_name: '食材管家',
          description: '记录食材库存、保鲜状态和每日消耗，快速搜索菜谱。',
          lang: 'zh-CN',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait-primary',
          theme_color: '#1f6b4f',
          background_color: '#f4f6f1',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png}'],
          navigateFallback: 'index.html',
          runtimeCaching: [],
        },
      }),
    ],
  };
});
