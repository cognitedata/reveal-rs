import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import macrosPlugin from 'vite-plugin-babel-macros';

export default defineConfig(({ command }) => {
  let env = {};
  const baseConfig: Record<string, any> = {};
  if (command === 'serve') {
    baseConfig.server = {
      fs: {
        allow: ['../..'],
      },
    };
    env = {
      NODE_ENV: 'development',
      ...loadEnv('development', process.cwd(), 'REACT_APP_'),
      ...loadEnv('development', process.cwd(), 'PUBLIC_URL'),
    };
  } else {
    env = {
      NODE_ENV: 'production',
      ...loadEnv('production', process.cwd(), 'REACT_APP_'),
      ...loadEnv('production', process.cwd(), 'PUBLIC_URL'),
    };
  }
  return {
    ...baseConfig,
    plugins: [
      react(),
      tsConfigPaths({
        root: `${process.cwd()}/../..`,
        projects: ['tsconfig.json', 'apps/linewalk/tsconfig.json'],
      }),
      svgr(),
      macrosPlugin(),
      splitVendorChunkPlugin(),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true,
      alias: {
        crypto: require.resolve('rollup-plugin-node-builtins'),
      },
    },
    base: command === 'build' ? '/PUBLIC_URL_VALUE/' : '/',
    define: {
      'process.env': env,
    },
    build: {
      sourcemap: command === 'build',
      commonjsOptions: {
        include: [],
      },
      rollupOptions: { treeshake: false },
    },
  };
});
