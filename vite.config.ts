import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',
      exclude: [
        'node_modules',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
      ],
      extension: ['.js', '.ts', '.tsx'],
      requireEnv: false,
      forceBuildInstrument: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
})
