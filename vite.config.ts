import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const __dirname = path.resolve();

export default defineConfig(
  ({ mode }: { mode: 'development' | 'production' }) => ({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    build: {
      outDir: mode === 'production' ? 'dist' : 'dev',
      rollupOptions: {
        input: {
          popup: 'src/ui/index.tsx',
          background: 'src/background/background.ts',
        },
        output: {
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
      cssCodeSplit: false,
    },
    publicDir: 'public',
  }),
);
