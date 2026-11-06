import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// 出力先は従来どおり build（Vercelの出力先設定を変えずに済ませるため）
export default defineConfig({
  plugins: [react()],
  build: { outDir: "build" },
})
