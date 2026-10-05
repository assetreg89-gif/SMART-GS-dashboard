import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT || '14071', 10);

  return {
    plugins: [react()],
    resolve: {
      // xlsx-js-style includes an optional Node stream integration. It is not
      // used by browser exports, but Vite otherwise externalizes it and the
      // package accesses stream.Readable while it is loading.
      alias: {
        stream: fileURLToPath(new URL('./src/shims/stream.js', import.meta.url))
      }
    },
    server: {
      port: port,
      host: true
    }
  };
});
