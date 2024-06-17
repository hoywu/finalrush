import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
// 按需导入
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// 按需导入图标
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd());
  return {
    base: env.VITE_BASE_PATH,

    plugins: [
      vue(),
      AutoImport({
        dts: './types/auto-imports.d.ts',
        imports: [
          'vue',
          'vue-router',
          {
            axios: [['default', 'axios']],
          },
        ],
        resolvers: [ElementPlusResolver()],
        defaultExportByFilename: false,
        vueTemplate: true,
      }),
      Components({
        dts: './types/components.d.ts',
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: 'icon',
          }),
        ],
        dirs: ['./src/components', './src/components/**'],
      }),
      Icons(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
