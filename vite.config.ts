import react from '@vitejs/plugin-react';
import vite from 'vite';
const { defineConfig } = vite;

export default defineConfig(
	({ mode }: { mode: 'development' | 'production' }) => ({
		plugins: [react()],
		css: {
			modules: true,
		},
		build: {
			outDir: mode === 'production' ? 'dist' : 'dev',
			rollupOptions: {
				input: {
					popup: 'src/popup/index.tsx',
					background: 'src/background/background.ts',
				},
				output: {
					entryFileNames: '[name].js',
					assetFileNames: 'assets/[name].[ext]',
				},
			},
		},
		// Удалить, если не буду использовать
		server: {
			port: 3000,
			open: true,
		},
	})
);
