import { defineConfig, mergeConfig } from 'vite';

const specificConfigs = {
  default: {
    esbuild: {
      drop: ['console'],
    },
  },
  debug: {
    build: {
      lib: {
        fileName: 'inet6.debug',
      },
    },
  }
};

export default defineConfig(
  mergeConfig({
    build: {
      emptyOutDir: false,
      lib: {
        entry: ['src/inet6.ts'],
        formats: ['es'],
      },
    },
  }, (process.env.BUILD_DEBUG) ? specificConfigs.debug : specificConfigs.default)
);
