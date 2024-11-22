/* eslint-disable import/no-default-export */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  dialect: 'sqlite',
  schema: './src/schema.ts',
  dbCredentials: {
    url: 'movies.db',
  },
});
