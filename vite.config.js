import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bypass25-ctf-writeup/',
  plugins: [react()],
})
