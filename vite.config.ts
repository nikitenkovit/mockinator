import react from '@vitejs/plugin-react';
import vite from 'vite';
const { defineConfig } = vite;

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
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
});
