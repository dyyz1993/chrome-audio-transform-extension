import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@contracts': '/src/contracts',
      '@adapters': '/src/adapters',
      '@content': '/src/content',
      '@core': '/src/core',
      '@types': '/src/types',
      '@popup': '/src/popup',
      '@options': '/src/options'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html',
        'background/index': 'src/background/index.ts',
        'content/index': 'src/content/index.ts',
        'content/inject': 'src/content/inject.ts',
        'offscreen/index': 'src/offscreen/index.html'
      },
      output: {
        entryFileNames: assetInfo => {
          const name = assetInfo.name?.replace(/\.[jt]sx?$/, '') || 'index'
          return `assets/${name}.js`
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  server: {
    port: 5173
  }
})
