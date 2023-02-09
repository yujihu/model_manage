import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// https://github.com/antfu/unplugin-auto-import
import AutoImport from 'unplugin-auto-import/vite';
// https://github.com/antfu/unplugin-vue-components
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// https://github.com/antfu/unplugin-icons
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true, // https://staging-cn.vuejs.org/guide/extras/reactivity-transform.html#explicit-opt-in
    }),
    AutoImport({
      imports: [
        'vue', // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        'vue/macros', // 响应性语法糖 https://staging-cn.vuejs.org/guide/extras/reactivity-transform.html
      ],
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      // Auto import for all module exports under directories
      dirs: ['./src/composables', './src/stores'],
      // Auto import inside Vue template
      vueTemplate: true,
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({}),
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],
    }),
    Icons({}),
  ],
});
