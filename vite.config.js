import {defineConfig} from 'vite';
import pluginReact from '@vitejs/plugin-react';
import metaversefilePlugin from 'metaversefile/plugins/rollup.js';

export default defineConfig(({command, mode, ssrBuild}) => {
  return {
    plugins: (command === 'build' ? [] : [metaversefilePlugin()]).concat([
      pluginReact(),
    ]),
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      fs: {
        strict: true,
      },
    },
    esbuild: {
      loader: 'jsx',
    },
  };
});
