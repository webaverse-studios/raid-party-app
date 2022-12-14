import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import jsconfigPaths from 'vite-jsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  assetsInclude: ['**/*.glb', '**/*.hdr'],
  plugins: [glsl(), react(), jsconfigPaths()],
});
