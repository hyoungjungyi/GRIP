import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true, // 포트가 사용 중이면 다른 포트를 시도하지 않고 에러 발생
    host: true // 네트워크에서 접근 가능하도록 설정 (선택사항)
  }
})
