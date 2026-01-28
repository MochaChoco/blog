import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CommentBox',
      formats: ['es', 'umd', 'cjs'],
      fileName: (format) => `comment-box.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        assetFileNames: 'comment-box.[ext]',
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "src/ui/styles/variables" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
