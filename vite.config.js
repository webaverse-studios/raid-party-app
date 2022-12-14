import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import jsconfigPaths from 'vite-jsconfig-paths';
import metaversefilePlugin from 'metaversefile/plugins/rollup.js';

// https://vitejs.dev/config/
export default defineConfig(command => {
  return {
    server: {
      fs: {
        strict: true,
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    assetsInclude: ['**/*.glb', '**/*.hdr'],
    plugins: (command === 'build' ? [] : [metaversefilePlugin()]).concat([
      glsl(),
      react(),
      jsconfigPaths(),
    ]),
  };
});
