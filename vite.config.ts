import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Adicione estas configurações
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./utils', import.meta.url)),
      '@types': fileURLToPath(new URL('./types', import.meta.url)),
      '@constants': fileURLToPath(new URL('./constants', import.meta.url)),
    }
  },
  
  // Otimizações para produção
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['jspdf', 'file-saver']
        }
      }
    }
  },
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 3000,
    open: true // Abre o navegador automaticamente
  },
  
  // Para garantir compatibilidade com Netlify
  preview: {
    port: 3000
  }
});