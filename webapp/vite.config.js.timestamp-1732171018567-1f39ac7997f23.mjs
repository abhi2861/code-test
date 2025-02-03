// vite.config.js
import { defineConfig, transformWithEsbuild } from "file:///C:/Users/hp/Desktop/VibhuUserPanel/Investment%2520Opportunity/webapp/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/hp/Desktop/VibhuUserPanel/Investment%2520Opportunity/webapp/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    {
      name: "treat-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic"
        });
      }
    },
    react()
  ],
  server: {
    port: 8e3
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxocFxcXFxEZXNrdG9wXFxcXFZpYmh1VXNlclBhbmVsXFxcXEludmVzdG1lbnQlMjBPcHBvcnR1bml0eVxcXFx3ZWJhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGhwXFxcXERlc2t0b3BcXFxcVmliaHVVc2VyUGFuZWxcXFxcSW52ZXN0bWVudCUyME9wcG9ydHVuaXR5XFxcXHdlYmFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvaHAvRGVza3RvcC9WaWJodVVzZXJQYW5lbC9JbnZlc3RtZW50JTI1MjBPcHBvcnR1bml0eS93ZWJhcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHRyYW5zZm9ybVdpdGhFc2J1aWxkIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHtcclxuXHRcdFx0bmFtZTogJ3RyZWF0LWpzLWZpbGVzLWFzLWpzeCcsXHJcblx0XHRcdGFzeW5jIHRyYW5zZm9ybShjb2RlLCBpZCkge1xyXG5cdFx0XHRcdGlmICghaWQubWF0Y2goL3NyY1xcLy4qXFwuanMkLykpIHJldHVybiBudWxsO1xyXG5cclxuXHRcdFx0XHQvLyBVc2UgdGhlIGV4cG9zZWQgdHJhbnNmb3JtIGZyb20gdml0ZSwgaW5zdGVhZCBvZiBkaXJlY3RseVxyXG5cdFx0XHRcdC8vIHRyYW5zZm9ybWluZyB3aXRoIGVzYnVpbGRcclxuXHRcdFx0XHRyZXR1cm4gdHJhbnNmb3JtV2l0aEVzYnVpbGQoY29kZSwgaWQsIHtcclxuXHRcdFx0XHRcdGxvYWRlcjogJ2pzeCcsXHJcblx0XHRcdFx0XHRqc3g6ICdhdXRvbWF0aWMnLFxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHRcdHJlYWN0KCksXHJcblx0XSxcclxuXHRzZXJ2ZXI6IHtcclxuXHRcdHBvcnQ6IDgwMDAsXHJcblx0ICB9LFxyXG5cdG9wdGltaXplRGVwczoge1xyXG5cdFx0Zm9yY2U6IHRydWUsXHJcblx0XHRlc2J1aWxkT3B0aW9uczoge1xyXG5cdFx0XHRsb2FkZXI6IHtcclxuXHRcdFx0XHQnLmpzJzogJ2pzeCcsXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdZLFNBQVMsY0FBYyw0QkFBNEI7QUFDM2IsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSO0FBQUEsTUFDQyxNQUFNO0FBQUEsTUFDTixNQUFNLFVBQVUsTUFBTSxJQUFJO0FBQ3pCLFlBQUksQ0FBQyxHQUFHLE1BQU0sY0FBYyxFQUFHLFFBQU87QUFJdEMsZUFBTyxxQkFBcUIsTUFBTSxJQUFJO0FBQUEsVUFDckMsUUFBUTtBQUFBLFVBQ1IsS0FBSztBQUFBLFFBQ04sQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNEO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ0w7QUFBQSxFQUNGLGNBQWM7QUFBQSxJQUNiLE9BQU87QUFBQSxJQUNQLGdCQUFnQjtBQUFBLE1BQ2YsUUFBUTtBQUFBLFFBQ1AsT0FBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUVELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
