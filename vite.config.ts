import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.tsx"),
      name: "LeoQuery",  // This is important for UMD builds
      formats: ["es", "cjs", "umd"],  // Added UMD for direct browser usage
      fileName: (format) => `index.${format === "es" ? "js" : format}`
    },
    rollupOptions: {
      external: ["react", "zustand", "immer"],
      output: {
        // Globals are important for UMD builds
        globals: {
          react: "React",
          zustand: "zustand",
          immer: "immer"
        }
      }
    },
    sourcemap: true
  },
  plugins: [dts()]
});