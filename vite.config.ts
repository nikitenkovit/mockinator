import react from '@vitejs/plugin-react';
import vite from 'vite';
const { defineConfig } = vite;

export default defineConfig(
  ({ mode }: { mode: 'development' | 'production' }) => ({
    plugins: [react()],
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
