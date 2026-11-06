import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// 出力先は Vite 標準の dist（Vercel が Vite と判定して dist を探すため、既定に揃える）
export default defineConfig({
  plugins: [react()],
})
