import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Les dates du site sont calculées à l'heure de Paris : les tests ne doivent pas dépendre du fuseau de la machine.
    env: { TZ: 'America/New_York' },
  },
});
