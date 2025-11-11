import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT ?? 5173);
export default defineConfig({
    plugins: [react()],
    server: {
        port: Number.isFinite(devServerPort) ? devServerPort : 5173,
        proxy: {
            "/api": {
                target: "http://localhost:4000",
                changeOrigin: true,
            },
        },
    },
});
