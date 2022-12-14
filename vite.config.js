import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import jsconfigPaths from 'vite-jsconfig-paths';
import fs from 'fs/promises';

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
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({filter: /src\\.*\.js$/}, async args => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }));
          },
        },
      ],
    },
  },
  plugins: [glsl(), react(), jsconfigPaths()],
});
